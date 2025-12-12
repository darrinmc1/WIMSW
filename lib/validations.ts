import { z } from "zod";

// Constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes (base64 adds ~33% overhead)
const MAX_BASE64_SIZE = MAX_IMAGE_SIZE * 1.37; // Account for base64 encoding overhead

/**
 * Validate base64 image size
 */
function validateImageSize(base64Image: string): boolean {
  // Remove data URL prefix to get just the base64 data
  const base64Data = base64Image.split(',')[1] || base64Image;
  // Calculate approximate file size in bytes (base64 is ~33% larger than original)
  const sizeInBytes = (base64Data.length * 3) / 4;
  return sizeInBytes <= MAX_IMAGE_SIZE;
}

// Validation schema for analyze-item API
export const analyzeItemSchema = z.object({
  image: z
    .string()
    .min(1, "Image data is required")
    .startsWith("data:image/", "Invalid image format")
    .refine(
      (data) => data.length <= MAX_BASE64_SIZE,
      `Image too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (data) => validateImageSize(data),
      `Image file size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`
    ),
});

// Validation schema for market-research API
export const marketResearchSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  size: z.string().optional(),
  condition: z.string().min(1),
  estimated_price: z.number().positive(),
  description: z.string().optional(),
  sizeInput: z.string().optional(),
  ageInput: z.string().optional(),
  isLocalOnly: z.boolean().optional().default(false),
  bustCache: z.boolean().optional().default(false), // Force fresh data
});

// Validation schema for contact-sales API
export const contactSalesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Validation schema for generate-listing API
export const generateListingSchema = z.object({
  name: z.string().min(1, "Item Name is required"),
  brand: z.string().optional(),
  category: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
  features: z.string().optional(),
});

// Helper function to validate request body
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return { success: false, error: errorMessages };
    }
    return { success: false, error: "Validation failed" };
  }
}
