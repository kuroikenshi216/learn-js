import { z } from "zod";

export const usernameSchema = z.object({
    // github's own rules: letters, numbers and single hyphens, max 39 chars
    username: z.string().regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, "Invalid GitHub username"),
});
