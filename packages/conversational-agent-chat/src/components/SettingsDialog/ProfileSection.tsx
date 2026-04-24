import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
} from "@mui/material";
import type {
  ConversationalAgent,
  UserSettingsGetResponse,
  UserSettingsUpdateOptions,
} from "@uipath/uipath-typescript/conversational-agent";
import { useEffect, useMemo, useState } from "react";
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
  // Legacy react-sdk records stored El Salvador as "EV" (not a valid ISO code).
  // Coerce on read so the Autocomplete matches and we write "SV" back on save.
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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    conversationalAgent.user
      .getSettings()
      .then((settings) => {
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

  const countryOptions = useMemo<CountryCode[]>(
    () =>
      (Object.keys(COUNTRY_CODES) as CountryCode[]).sort((a, b) =>
        t(COUNTRY_CODES[a]).localeCompare(t(COUNTRY_CODES[b])),
      ),
    [t],
  );

  const timezoneOptions = useMemo<string[]>(() => {
    const intl = (
      Intl as unknown as { supportedValuesOf?: (kind: string) => string[] }
    ).supportedValuesOf;
    return typeof intl === "function" ? intl("timeZone") : [];
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
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Alert severity="error">
        {t("error_load_profile", { errorMessage: loadError })}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <TextField
          label={t("name_label")}
          value={form.name ?? ""}
          onChange={(e) => handleChange("name")(e.target.value)}
          fullWidth
        />
        <TextField
          label={t("email_label")}
          type="email"
          value={form.email ?? ""}
          onChange={(e) => handleChange("email")(e.target.value)}
          error={emailInvalid}
          helperText={emailInvalid ? t("error_invalid_email") : undefined}
          fullWidth
        />
        <TextField
          label={t("role_label")}
          value={form.role ?? ""}
          onChange={(e) => handleChange("role")(e.target.value)}
          fullWidth
        />
        <TextField
          label={t("department_label")}
          value={form.department ?? ""}
          onChange={(e) => handleChange("department")(e.target.value)}
          fullWidth
        />
        <TextField
          label={t("company_label")}
          value={form.company ?? ""}
          onChange={(e) => handleChange("company")(e.target.value)}
          fullWidth
          sx={{ gridColumn: "span 2" }}
        />
        <Autocomplete
          options={countryOptions}
          value={(form.country as CountryCode) || null}
          onChange={(_, value) => handleChange("country")(value ?? "")}
          getOptionLabel={(code) =>
            code in COUNTRY_CODES ? t(COUNTRY_CODES[code as CountryCode]) : ""
          }
          renderInput={(params) => (
            <TextField {...params} label={t("country_label")} />
          )}
          fullWidth
        />
        <Autocomplete
          options={timezoneOptions}
          value={form.timezone || null}
          onChange={(_, value) => handleChange("timezone")(value ?? "")}
          renderInput={(params) => (
            <TextField {...params} label={t("timezone_label")} />
          )}
          fullWidth
        />
      </Box>
      {saveError && (
        <Alert severity="error">
          {t("error_save_profile", { errorMessage: saveError })}
        </Alert>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!dirty || saving || emailInvalid}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving ? t("saving_button_label") : t("save_changes_button_label")}
        </Button>
      </Box>
    </Stack>
  );
};
