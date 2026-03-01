import { StatusEnum } from "../../constants/contact.js";

export const VALID_CONTACT = {
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890",
    company: "Acme Corp",
    status: StatusEnum.LEAD,
    notes: "Test note",
} as const;
