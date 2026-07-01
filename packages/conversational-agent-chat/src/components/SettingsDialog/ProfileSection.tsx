import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Label,
  Spinner,
  cn,
} from "@uipath/apollo-wind";
// Portal-aware Combobox so the menu opens inside the widget subtree regardless
// of host surface (see dropdowns/PortalContainerProvider).
import { Combobox } from "../dropdowns";
import type {
  ConversationalAgent,
  UserSettingsGetResponse,
  UserSettingsUpdateOptions,
} from "@uipath/uipath-typescript/conversational-agent";
import { useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { COUNTRY_CODES, type CountryCode } from "../../constants/countries";

export interface ProfileSectionProps {
  conversationalAgent: ConversationalAgent;
  onSaved?: () => void;
}

type FormState = Pick<
  UserSettingsGetResponse,
  "name" | "email" | "role" | "department" | "company" | "country" | "timezone"
>;

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  role: "",
  department: "",
  company: "",
  country: "",
  timezone: "",
};

const toFormState = (settings: UserSettingsGetResponse): FormState => ({
  name: settings.name ?? "",
  email: settings.email ?? "",
  role: settings.role ?? "",
  department: settings.department ?? "",
  company: settings.company ?? "",
  // Legacy records stored El Salvador as "EV" (not a valid ISO code).
  // Coerce on read so the Combobox matches and we write "SV" back on save.
  country: settings.country === "EV" ? "SV" : (settings.country ?? ""),
  timezone: settings.timezone ?? "",
});

// SDK contract: omitted fields mean "no change"; `null` explicitly clears.
// So we send only the fields the user actually touched.
const toUpdateOptions = (
  form: FormState,
  initial: FormState,
): UserSettingsUpdateOptions => {
  const normalize = (value: string) =>
    value.trim() === "" ? null : value.trim();
  const patch: UserSettingsUpdateOptions = {};
  (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
    if (form[key] !== initial[key]) {
      patch[key] = normalize(form[key] ?? "");
    }
  });
  return patch;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (email: string) => EMAIL_REGEX.test(email);

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: boolean;
  helperText?: string;
  className?: string;
}

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  error,
  helperText,
  className,
}: FieldProps) => {
  const id = useId();
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "text-sm text-muted-foreground",
          error && "text-destructive",
        )}
      >
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "bg-background",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      {helperText && (
        <span
          className={cn(
            "text-xs text-muted-foreground",
            error && "text-destructive",
          )}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export const ProfileSection = ({
  conversationalAgent,
  onSaved,
}: ProfileSectionProps) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [initial, setInitial] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const countryLabelId = useId();
  const timezoneLabelId = useId();

  useEffect(() => {
    let cancelled = false;
    conversationalAgent.user
      .getSettings()
      .then((settings: UserSettingsGetResponse) => {
        if (cancelled) return;
        const initialForm = toFormState(settings);
        setInitial(initialForm);
        setForm(initialForm);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conversationalAgent]);

  // apollo-wind's Combobox passes `item.value` straight into cmdk, which
  // filters items by that string only. Encoding the country name into the
  // value (joined with `|`) makes the search match country names instead of
  // just the 2-letter code. cmdk lowercases values internally for matching,
  // so we keep both halves lowercase and re-uppercase the code on selection.
  const countryItems = useMemo(
    () =>
      (Object.keys(COUNTRY_CODES) as CountryCode[])
        .map((code) => {
          // Keys come from COUNTRY_CODES (country_name_*), enumerated in en/index.json.
          // eslint-disable-next-line no-restricted-syntax
          const label = t(COUNTRY_CODES[code]);
          return {
            value: `${code.toLowerCase()}|${label.toLowerCase()}`,
            label,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    [t],
  );

  const countryValue = useMemo(() => {
    if (!form.country) return "";
    const prefix = `${form.country.toLowerCase()}|`;
    return (
      countryItems.find((item) => item.value.startsWith(prefix))?.value ?? ""
    );
  }, [form.country, countryItems]);

  const handleCountryChange = (encoded: string) => {
    const code = encoded.split("|")[0] ?? "";
    handleChange("country")(code.toUpperCase());
  };

  const timezoneItems = useMemo(() => {
    const intl = (
      Intl as unknown as { supportedValuesOf?: (kind: string) => string[] }
    ).supportedValuesOf;
    const values = typeof intl === "function" ? intl("timeZone") : [];
    return values.map((v) => ({ value: v, label: v }));
  }, []);

  const dirty = useMemo(() => {
    if (!initial) return false;
    return (Object.keys(form) as (keyof FormState)[]).some(
      (k) => form[k] !== initial[k],
    );
  }, [form, initial]);

  const handleChange = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const trimmedEmail = (form.email ?? "").trim();
  const emailInvalid = trimmedEmail !== "" && !isValidEmail(trimmedEmail);

  const handleSave = async () => {
    if (!initial) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await conversationalAgent.user.updateSettings(
        toUpdateOptions(form, initial),
      );
      const next = toFormState(updated);
      setInitial(next);
      setForm(next);
      onSaved?.();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="sm" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t("error_load_profile", { errorMessage: loadError })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label={t("name_label")}
          value={form.name ?? ""}
          onChange={handleChange("name")}
        />
        <Field
          label={t("email_label")}
          type="email"
          value={form.email ?? ""}
          onChange={handleChange("email")}
          error={emailInvalid}
          helperText={emailInvalid ? t("error_invalid_email") : undefined}
        />
        <Field
          label={t("role_label")}
          value={form.role ?? ""}
          onChange={handleChange("role")}
        />
        <Field
          label={t("department_label")}
          value={form.department ?? ""}
          onChange={handleChange("department")}
        />
        <Field
          label={t("company_label")}
          value={form.company ?? ""}
          onChange={handleChange("company")}
          className="col-span-2"
        />
        <div className="flex flex-col gap-1.5">
          <Label id={countryLabelId} className="text-sm text-muted-foreground">
            {t("country_label")}
          </Label>
          <Combobox
            items={countryItems}
            value={countryValue}
            onValueChange={handleCountryChange}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label id={timezoneLabelId} className="text-sm text-muted-foreground">
            {t("timezone_label")}
          </Label>
          <Combobox
            items={timezoneItems}
            value={form.timezone ?? ""}
            onValueChange={handleChange("timezone")}
          />
        </div>
      </div>
      {saveError && (
        <Alert variant="destructive">
          <AlertDescription>
            {t("error_save_profile", { errorMessage: saveError })}
          </AlertDescription>
        </Alert>
      )}
      <div className="flex justify-start">
        <Button
          onClick={handleSave}
          disabled={!dirty || saving || emailInvalid}
        >
          {saving && <Spinner size="sm" className="mr-2" />}
          {saving
            ? t("applying_changes_button_label")
            : t("apply_changes_button_label")}
        </Button>
      </div>
    </div>
  );
};
