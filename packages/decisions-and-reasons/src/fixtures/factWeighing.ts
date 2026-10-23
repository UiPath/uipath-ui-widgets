import type { FactWeighingProps } from "../components/FactWeighing/types";

export const FIXTURE_FACTS: Omit<FactWeighingProps, "onComplete"> = {
  title: "Review order ORD1018653",
  subtitle: "Placed 2026-10-21 14:32 UTC · Customer CUS-5530194",
  ruleStatus: "Rule table v0: no row matched",
  proposedBy: "Fraud screening agent",
  recommendation: {
    outcome: "Decline",
    risk: 0.93,
    confidence: "high",
    reason:
      "Shipping address was used by three other accounts this week and the card failed twice before this attempt.",
    evidence: [
      "Shipping address shared with 3 accounts in 7 days",
      "2 declined card attempts in the last hour",
      "Account created 4 minutes before the order",
    ],
  },
  items: [
    {
      id: "order-total",
      group: "Order",
      label: "Order total",
      subtitle: "Typical customer average is 96.00",
      value: "1,284.00",
      agentRead: "Leans fraud",
    },
    {
      id: "order-items",
      group: "Order",
      label: "Items",
      value: "6 units, 2 SKUs",
    },
    {
      id: "promo-code",
      group: "Order",
      label: "Promo code",
      subtitle: "Used on 41 orders this month",
      value: "WELCOME25",
    },
    {
      id: "account-age",
      group: "Account",
      label: "Account age",
      value: "4 minutes",
      agentRead: "Strongly fraud",
    },
    {
      id: "prior-orders",
      group: "Account",
      label: "Prior orders",
      value: "0",
      agentRead: "Leans fraud",
    },
    {
      id: "email-domain",
      group: "Account",
      label: "Email domain",
      value: "mailbox-temp.example",
    },
    {
      id: "card-attempts",
      group: "Payment",
      label: "Card attempts",
      subtitle: "Last hour",
      value: "3 (2 declined)",
      agentRead: "Strongly fraud",
    },
    {
      id: "billing-match",
      group: "Payment",
      label: "Billing address match",
      value: "Matches card issuer",
      agentRead: "Leans legitimate",
    },
    {
      id: "device-known",
      group: "Device and address",
      label: "Device seen before",
      value: "No",
    },
    {
      id: "shared-address",
      group: "Device and address",
      label: "Shipping address shared",
      subtitle: "Other accounts, last 7 days",
      value: "3 accounts",
      agentRead: "Strongly fraud",
    },
    {
      id: "ip-region",
      group: "Device and address",
      label: "IP region",
      value: "Same region as shipping",
      agentRead: "Leans legitimate",
    },
  ],
};
