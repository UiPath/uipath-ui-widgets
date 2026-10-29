import type { TriageRoutingProps } from "../components/TriageRouting/types";

export const FIXTURE_TRIAGE: Omit<TriageRoutingProps, "onComplete"> = {
  title: "Ticket TCK-30418",
  subtitle: "Cannot export monthly usage report since the update",
  proposedBy: "Ticket triage agent v2",
  facts: [
    { label: "Requester", value: "Finance Operations contact" },
    { label: "Channel", value: "Email" },
  ],
  excerpt:
    "Since last night's update the monthly usage export fails with a timeout. Finance closes the books on Friday and we need the file before then.",
  labels: [
    {
      id: "category",
      label: "Category",
      options: ["Reporting", "Access", "Billing", "Integration", "Other"],
      proposed: "Reporting",
      confidence: 93,
      reason: "The request is about exporting a report.",
      changeReasons: [
        "Root cause is elsewhere",
        "Request covers two areas",
        "Other",
      ],
    },
    {
      id: "priority",
      label: "Priority",
      options: ["Low", "Normal", "High", "Urgent"],
      proposed: "Normal",
      confidence: 71,
      reason: "No outage is described and a workaround may exist.",
      changeReasons: [
        "Deadline is close",
        "Many users affected",
        "Not blocking anyone",
        "Other",
      ],
    },
    {
      id: "team",
      label: "Routing team",
      options: [
        "Reporting support",
        "Platform engineering",
        "Finance systems",
        "Customer success",
      ],
      proposed: "Reporting support",
      confidence: 84,
      reason: "Reporting exports are handled by this team.",
      changeReasons: ["Needs an engineer", "Customer is at risk", "Other"],
    },
  ],
};
