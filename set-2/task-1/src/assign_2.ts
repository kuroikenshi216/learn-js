type RawScalar = string | number | boolean | null | undefined;

interface RawUser {
    user_id?: RawScalar;
    full_name?: RawScalar;
    email_address?: RawScalar;
    age?: RawScalar;
    role?: RawScalar;
    phone?: RawScalar;
    is_active?: RawScalar;
    created_at?: RawScalar;
    internal_notes?: RawScalar;
}

interface MappedUser {
    id: RawScalar;
    name: RawScalar;
    email: RawScalar;
    age: RawScalar;
    role: RawScalar;
    phone: RawScalar;
    isActive: RawScalar;
    createdAt: RawScalar;
}

interface NormalizedUser {
    id: string | null;
    name: string | null;
    email: string | null;
    age: number | null;
    role: string | null;
    phone: string | null;
    isActive: boolean;
    createdAt: string | null;
}

interface RequiredUser extends NormalizedUser {
    id: string;
    name: string;
    email: string;
}

interface User extends RequiredUser {
    isAdmin: boolean;
}

class UserDataTransformer {
    transform(rawUsers: RawUser[]): User[] {
        const seenEmails = new Set<string>();

        return rawUsers
            .map(rawUser => this.#mapFields(rawUser))
            .map(user => this.#normalizeFields(user))
            .filter((user): user is RequiredUser => this.#hasRequiredFields(user))
            .filter(user => this.#validateEmail(user.email))
            .filter(user => this.#isUniqueEmail(user.email, seenEmails))
            .map(user => this.#addDerivedField(user));
    }

    #mapFields(rawUser: RawUser): MappedUser {
        return {
            id: rawUser.user_id,
            name: rawUser.full_name,
            email: rawUser.email_address,
            age: rawUser.age,
            role: rawUser.role,
            phone: rawUser.phone,
            isActive: rawUser.is_active,
            createdAt: rawUser.created_at,
        };
    }

    #normalizeFields(user: MappedUser): NormalizedUser {
        return {
            id: this.#normalizeString(user.id),
            name: this.#normalizeString(user.name),
            email: this.#normalizeString(user.email, true),
            age: this.#normalizeNumber(user.age),
            role: this.#normalizeString(user.role, true),
            phone: this.#normalizeString(user.phone),
            isActive: this.#normalizeBool(user.isActive),
            createdAt: this.#normalizeString(user.createdAt),
        };
    }

    #hasRequiredFields(user: NormalizedUser): user is RequiredUser {
        return Boolean(user.id && user.name && user.email);
    }

    #validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    #isUniqueEmail(email: string, seenEmails: Set<string>): boolean {
        if (seenEmails.has(email)) {
            return false;
        }

        seenEmails.add(email);
        return true;
    }

    #addDerivedField(user: RequiredUser): User {
        return {
            ...user,
            isAdmin: user.role === "admin" && user.isActive,
        };
    }

    #normalizeString(value: RawScalar, toLower = false): string | null {
        if (typeof value !== "string") {
            return null;
        }

        const normalized = value.trim();

        if (toLower) {
            return normalized.toLowerCase();
        }

        return normalized;
    }

    #normalizeNumber(value: RawScalar): number | null {
        if (typeof value !== "number" && typeof value !== "string") {
            return null;
        }

        if (value === "") {
            return null;
        }

        const normalized = Number(value);

        return Number.isFinite(normalized) ? normalized : null;
    }

    #normalizeBool(value: RawScalar): boolean {
        if (typeof value === "boolean") {
            return value;
        }

        if (typeof value !== "string") {
            return false;
        }

        const normalized = value.trim().toLowerCase();

        if (["false", "no", "0", ""].includes(normalized)) {
            return false;
        }

        if (["true", "yes", "1"].includes(normalized)) {
            return true;
        }

        return false;
    }
}

function runAssignment2(): void {
    const rawUsers: RawUser[] = [
        {
            user_id: "U1001",
            full_name: "  John Doe ",
            email_address: "JOHN.DOE@EXAMPLE.COM ",
            age: "29",
            role: " ADMIN ",
            phone: "+91 98765 43210",
            is_active: "true",
            created_at: "2026-01-15T10:30:00Z",
            internal_notes: "VIP customer",
        },
        {
            user_id: "U1002",
            full_name: "Jane Smith",
            email_address: " jane.smith@example.com",
            age: 34,
            role: "user",
            phone: "9876543211",
            is_active: true,
            created_at: "2026-02-20T08:15:00Z",
            internal_notes: null,
        },
        {
            user_id: "U1003",
            full_name: "  ROBERT  BROWN",
            email_address: "Robert.Brown@Example.com",
            age: "41",
            role: "Manager",
            phone: null,
            is_active: "false",
            created_at: "2025-11-03T14:45:00Z",
            internal_notes: "Promoted recently",
        },
        {
            user_id: "U1004",
            full_name: "Alice Johnson ",
            email_address: "alice.johnson@example.com",
            age: "unknown",
            role: "USER",
            phone: "+44 7700 900123",
            is_active: "1",
            created_at: "2026-03-12T11:20:00Z",
            internal_notes: "",
        },
        {
            user_id: "U1005",
            full_name: "  David Wilson",
            email_address: "david.wilson@example.com ",
            age: "",
            role: null,
            phone: "  9123456789  ",
            is_active: "yes",
            created_at: null,
            internal_notes: "Missing signup date",
        },
        {
            user_id: "U1006",
            full_name: "Sarah Connor",
            email_address: "not-an-email",
            age: "37",
            role: "admin",
            phone: "+1 555 123 4567",
            is_active: "true",
            created_at: "2026-04-01T09:00:00Z",
            internal_notes: null,
        },
        {
            user_id: "U1007",
            full_name: "Michael Scott",
            email_address: "michael.scott@example.com",
            age: "45",
            role: " regional manager ",
            phone: undefined,
            is_active: 1,
            created_at: "2025-08-10T16:30:00Z",
            internal_notes: "Paper company background",
        },
        {
            user_id: "U1008",
            full_name: "",
            email_address: "empty.name@example.com",
            age: "26",
            role: "user",
            phone: null,
            is_active: false,
            created_at: "2026-05-18T12:00:00Z",
            internal_notes: null,
        },
        {
            user_id: "U1009",
            full_name: "Emily Davis",
            email_address: "emily.davis@example.com",
            age: "31",
            role: "User",
            phone: "+91-99887-77665",
            is_active: "false",
            created_at: "2026-06-01T07:30:00Z",
            internal_notes: "Prefers email",
        },

        // Duplicate email after normalization
        {
            user_id: "U1010",
            full_name: "John D.",
            email_address: " john.doe@example.com",
            age: "30",
            role: "user",
            phone: "+91 99999 11111",
            is_active: "true",
            created_at: "2026-06-15T10:00:00Z",
            internal_notes: null,
        },

        // Completely broken record
        {
            user_id: null,
            full_name: null,
            email_address: null,
            age: null,
            role: undefined,
            phone: undefined,
            is_active: undefined,
            created_at: undefined,
            internal_notes: undefined,
        },

        {
            user_id: "U1012",
            full_name: "  Olivia Martinez  ",
            email_address: "OLIVIA.MARTINEZ@EXAMPLE.COM",
            age: 28,
            role: "ADMIN",
            phone: "+34 612 345 678",
            is_active: "TRUE",
            created_at: "2026-07-02T18:20:00Z",
            internal_notes: "International user",
        },
    ];

    const transformer = new UserDataTransformer();
    const transformedUsers = transformer.transform(rawUsers);

    console.log(transformedUsers);
}

export default runAssignment2;
