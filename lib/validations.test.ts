import { describe, it, expect } from 'vitest';
import {
  analyzeItemSchema,
  marketResearchSchema,
  contactSalesSchema,
  generateListingSchema,
  validateRequest,
} from './validations';

describe('analyzeItemSchema', () => {
  it('should validate valid base64 image', () => {
    const validImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    const result = analyzeItemSchema.safeParse({ image: validImage });
    expect(result.success).toBe(true);
  });

  it('should reject empty image', () => {
    const result = analyzeItemSchema.safeParse({ image: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Image data is required');
    }
  });

  it('should reject non-image data URL', () => {
    const result = analyzeItemSchema.safeParse({ image: 'data:text/plain;base64,aGVsbG8=' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid image format');
    }
  });

  it('should reject image exceeding size limit', () => {
    // Create a base64 string that exceeds 10MB
    const largeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(15 * 1024 * 1024);
    const result = analyzeItemSchema.safeParse({ image: largeBase64 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('too large');
    }
  });

  it('should accept valid small image', () => {
    // Small valid base64 image (1x1 transparent PNG)
    const smallImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = analyzeItemSchema.safeParse({ image: smallImage });
    expect(result.success).toBe(true);
  });
});

describe('marketResearchSchema', () => {
  const validData = {
    name: 'Nike Air Max',
    brand: 'Nike',
    category: 'Shoes',
    condition: 'Good',
    estimated_price: 50,
  };

  it('should validate complete market research data', () => {
    const result = marketResearchSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate with optional fields', () => {
    const dataWithOptionals = {
      ...validData,
      description: 'Gently used',
      sizeInput: 'US 10',
      ageInput: '2 years',
      isLocalOnly: true,
    };
    const result = marketResearchSchema.safeParse(dataWithOptionals);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isLocalOnly).toBe(true);
    }
  });

  it('should reject missing required fields', () => {
    const incomplete = { name: 'Nike' };
    const result = marketResearchSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('should reject negative price', () => {
    const invalidPrice = { ...validData, estimated_price: -10 };
    const result = marketResearchSchema.safeParse(invalidPrice);
    expect(result.success).toBe(false);
  });

  it('should reject zero price', () => {
    const zeroPrice = { ...validData, estimated_price: 0 };
    const result = marketResearchSchema.safeParse(zeroPrice);
    expect(result.success).toBe(false);
  });

  it('should default isLocalOnly to false', () => {
    const result = marketResearchSchema.safeParse(validData);
    if (result.success) {
      expect(result.data.isLocalOnly).toBe(false);
    }
  });
});

describe('contactSalesSchema', () => {
  const validContact = {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'I need help with integration',
  };

  it('should validate complete contact data', () => {
    const result = contactSalesSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it('should validate with optional company field', () => {
    const withCompany = { ...validContact, company: 'Acme Corp' };
    const result = contactSalesSchema.safeParse(withCompany);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidEmail = { ...validContact, email: 'not-an-email' };
    const result = contactSalesSchema.safeParse(invalidEmail);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid email');
    }
  });

  it('should reject message shorter than 10 characters', () => {
    const shortMessage = { ...validContact, message: 'Too short' };
    const result = contactSalesSchema.safeParse(shortMessage);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 10 characters');
    }
  });

  it('should reject empty name', () => {
    const emptyName = { ...validContact, name: '' };
    const result = contactSalesSchema.safeParse(emptyName);
    expect(result.success).toBe(false);
  });
});

describe('generateListingSchema', () => {
  const validListing = {
    name: 'Nike Air Max 90',
    condition: 'Good',
  };

  it('should validate minimal listing data', () => {
    const result = generateListingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it('should validate with all optional fields', () => {
    const complete = {
      ...validListing,
      brand: 'Nike',
      category: 'Sneakers',
      features: 'Original box, barely worn',
    };
    const result = generateListingSchema.safeParse(complete);
    expect(result.success).toBe(true);
  });

  it('should reject missing name', () => {
    const noName = { condition: 'Good' };
    const result = generateListingSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it('should reject missing condition', () => {
    const noCondition = { name: 'Nike Air Max 90' };
    const result = generateListingSchema.safeParse(noCondition);
    expect(result.success).toBe(false);
  });
});

describe('validateRequest helper', () => {
  it('should return success for valid data', () => {
    const data = { name: 'Test', condition: 'Good' };
    const result = validateRequest(generateListingSchema, data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(data);
    }
  });

  it('should return error message for invalid data', () => {
    const invalidData = { name: '' };
    const result = validateRequest(generateListingSchema, invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe('string');
    }
  });

  it('should handle multiple validation errors', () => {
    const multipleErrors = {};
    const result = validateRequest(marketResearchSchema, multipleErrors);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should contain multiple error messages
      expect(result.error).toContain(',');
    }
  });
});
