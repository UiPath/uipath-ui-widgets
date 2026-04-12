import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AgentSchemaForm, type AgentSchemaFormHandle } from "./AgentSchemaForm";
import type { InputSchema } from "./types";
import { useRef } from "react";

/**
 * Wrapper that renders the form with a submit button and shows submitted data.
 */
const FormDemo = ({
  inputSchema,
  initialValues,
  disabled,
  collapsibleOptional,
}: {
  inputSchema: InputSchema;
  initialValues?: Record<string, unknown>;
  disabled?: boolean;
  collapsibleOptional?: boolean;
}) => {
  const formRef = useRef<AgentSchemaFormHandle>(null);
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(
    null,
  );

  return (
    <div style={{ maxWidth: 480 }}>
      <AgentSchemaForm
        inputSchema={inputSchema}
        initialValues={initialValues}
        disabled={disabled}
        collapsibleOptional={collapsibleOptional}
        formRef={formRef}
        onSubmit={(data) => setSubmitted(data)}
      />
      <button
        onClick={() => formRef.current?.submit()}
        disabled={disabled}
        style={{ marginTop: 16, padding: "8px 20px", cursor: "pointer" }}
      >
        Submit
      </button>
      {submitted && (
        <pre
          style={{
            marginTop: 16,
            fontSize: 12,
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 4,
          }}
        >
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  );
};

const meta = {
  title: "Components/AgentSchemaForm",
  component: FormDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Schema-driven form for UiPath Conversational Agents. Renders input fields from a JSON Schema. Used by the inputs page (pre-conversation), settings panel, and tool call confirmation.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFieldTypes: Story = {
  args: {
    inputSchema: {
      type: "object",
      required: ["message", "priority"],
      properties: {
        message: { type: "string", title: "Message" },
        count: { type: "integer", title: "Count" },
        ratio: { type: "number", title: "Ratio" },
        enabled: { type: "boolean", title: "Enabled" },
        priority: {
          type: "string",
          title: "Priority",
          enum: ["low", "normal", "high"],
        },
        startDate: { type: "string", format: "date", title: "Start Date" },
        startTime: { type: "string", format: "time", title: "Start Time" },
        deadline: { type: "string", format: "date-time", title: "Deadline" },
        tags: { type: "array", title: "Tags", items: { type: "string" } },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates every supported field type: text, integer, number, boolean, enum select, date, time, date-time, and array.",
      },
    },
  },
};

export const NestedObject: Story = {
  args: {
    inputSchema: {
      type: "object",
      required: ["recipient"],
      properties: {
        recipient: {
          type: "object",
          title: "Recipient",
          required: ["email"],
          properties: {
            name: { type: "string", title: "Name" },
            email: { type: "string", title: "Email" },
            address: {
              type: "object",
              title: "Address",
              properties: {
                street: { type: "string", title: "Street" },
                city: { type: "string", title: "City" },
              },
            },
          },
        },
        subject: { type: "string", title: "Subject" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Nested object fields with collapsible sections and deep required validation.",
      },
    },
  },
};

export const EnumWithLabels: Story = {
  args: {
    inputSchema: {
      type: "object",
      required: ["status"],
      properties: {
        status: {
          type: "string",
          title: "Status",
          enum: ["active", "paused", "archived"],
          oneOf: [
            { const: "active", title: "Active — currently running" },
            { const: "paused", title: "Paused — temporarily stopped" },
            { const: "archived", title: "Archived — no longer in use" },
          ],
        },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Enum field with display labels from oneOf const patterns.",
      },
    },
  },
};

export const CollapsibleOptional: Story = {
  args: {
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", title: "Name" },
        description: { type: "string", title: "Description" },
        notes: { type: "string", title: "Notes" },
        priority: {
          type: "string",
          title: "Priority",
          enum: ["low", "normal", "high"],
        },
      },
    },
    collapsibleOptional: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Optional fields hidden behind a "Show more" toggle, as used on the inputs page before a conversation starts.',
      },
    },
  },
};

export const PrePopulated: Story = {
  args: {
    inputSchema: {
      type: "object",
      required: ["to", "body"],
      properties: {
        to: { type: "string", title: "To" },
        subject: { type: "string", title: "Subject" },
        body: { type: "string", title: "Body" },
        urgent: { type: "boolean", title: "Urgent" },
      },
    },
    initialValues: {
      to: "alice@example.com",
      subject: "Follow-up",
      body: "Just checking in on the status.",
      urgent: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Form pre-populated with initial values, as seen in tool call confirmation where the agent proposes values the user can edit before confirming.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    inputSchema: {
      type: "object",
      required: ["to"],
      properties: {
        to: { type: "string", title: "To" },
        subject: { type: "string", title: "Subject" },
        urgent: { type: "boolean", title: "Urgent" },
        priority: {
          type: "string",
          title: "Priority",
          enum: ["low", "normal", "high"],
        },
      },
    },
    initialValues: {
      to: "alice@example.com",
      subject: "Confirmed",
      urgent: true,
      priority: "high",
    },
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "All fields disabled. Used during submission to prevent edits while the action is in flight.",
      },
    },
  },
};

export const RefAndNullableSchema: Story = {
  args: {
    inputSchema: {
      type: "object",
      required: ["message"],
      properties: {
        message: { type: "string", title: "Message" },
        priority: {
          anyOf: [
            { const: "high", title: "High" },
            { const: "normal", title: "Normal" },
            { const: "low", title: "Low" },
            { type: "null" },
          ],
          title: "Priority",
        },
      },
    } as InputSchema,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Schema using anyOf nullable and const enum patterns, as commonly returned by UiPath agent tool schemas. resolveSchema normalizes these before rendering.",
      },
    },
  },
};
