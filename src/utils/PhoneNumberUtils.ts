import { PhoneNumberUtil } from "google-libphonenumber";
import type { z } from "zod";

const phoneUtil = PhoneNumberUtil.getInstance();
const phoneNumberLimit: number = 15;

interface PhoneNumberData {
  phonePrefix: string;
  phoneCountryCode: string;
  phoneNumber: string;
}

const validateTHPhoneNumber = (data: PhoneNumberData) => {
  const { phoneCountryCode, phoneNumber = "" } = data;
  let isValid = true;

  // 10 digit
  if (phoneCountryCode.toLowerCase() === "th" && phoneNumber.length !== 10) {
    isValid = false;
  }

  return isValid;
};

const validatePhoneNumber = (data: PhoneNumberData, ctx: z.RefinementCtx) => {
  const { phonePrefix, phoneCountryCode, phoneNumber = "" } = data;
  let isValid = false;

  if (phoneNumber.length === 0)
    return ctx.addIssue({
      code: "custom",
      path: ["phoneNumber"],
      message: "Phone number is required",
    });

  if (!/^\d+$/.test(phoneNumber))
    return ctx.addIssue({
      code: "custom",
      path: ["phoneNumber"],
      message: "Phone number must contain only digits",
    });

  if (phoneNumber.length > phoneNumberLimit)
    return ctx.addIssue({
      code: "custom",
      path: ["phoneNumber"],
      message: `Phone number must be at most ${phoneNumberLimit} characters long`,
    });

  try {
    const parsedPhoneNumber = phoneUtil.parseAndKeepRawInput(
      phoneNumber,
      phoneCountryCode,
    );

    // Special case for TH phone number
    const isValidThPhoneNumber = validateTHPhoneNumber(data);
    if (!isValidThPhoneNumber) {
      return ctx.addIssue({
        code: "custom",
        path: ["phoneNumber"],
        message: "Phone number must be 10 digits",
      });
    }

    isValid = phoneUtil.isValidNumberForRegion(
      parsedPhoneNumber,
      phoneCountryCode,
    );
  } catch (e) {
    // Catch potential parsing errors
    return ctx.addIssue({
      code: "custom",
      path: ["phoneNumber"],
      message: "Invalid phone number format",
    });
  }

  if (!isValid) {
    return ctx.addIssue({
      code: "custom",
      path: ["phoneNumber"],
      message: `${phonePrefix}${phoneNumber} is not valid phone number`,
    });
  }
};

export { validatePhoneNumber };
