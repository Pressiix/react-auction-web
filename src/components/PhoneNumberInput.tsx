import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { countries } from "countries-list";

interface CountryOption {
  code: string;
  name: string;
  phone: string;
}

const countryOptions: CountryOption[] = Object.entries(countries).map(
  ([code, country]) => ({
    code,
    name: country.name,
    phone: country.phone[0].toString(),
  }),
);

interface PhoneNumberInputProps {
  error?: boolean;
  helperText?: string;
  name?: string;
  label?: string;
  onPhoneNumberChange?: (phoneNumber: string) => void;
  onPhonePrefixChange?: (prefix: string) => void;
  onPhoneCountryChange?: (country: string) => void;
  specificCountry?: string;
}

const PhoneNumberInput = forwardRef(function PhoneNumberInput(
  {
    error = false,
    helperText = "",
    name = "phoneNumber",
    onPhonePrefixChange,
    onPhoneNumberChange,
    onPhoneCountryChange,
    specificCountry,
  }: PhoneNumberInputProps,
  ref,
) {
  const defaultCountryOption =
    countryOptions.find((country) => country.code === "TH") ||
    countryOptions[0];
  const [selectedCountry, setSelectedCountry] =
    useState<CountryOption>(defaultCountryOption);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (defaultCountryOption && onPhonePrefixChange && onPhoneCountryChange) {
      onPhonePrefixChange(`+${defaultCountryOption.phone}`);
      onPhoneCountryChange(defaultCountryOption.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const countryOption = countryOptions.find(
      (country) => country.code === specificCountry,
    );
    if (countryOption && Object.keys(countryOption).length > 0) {
      setSelectedCountry(countryOption);
    }
  }, [specificCountry]);

  const handleCountryChange = useCallback(
    (country: CountryOption) => {
      setSelectedCountry(country);
      setIsDropdownOpen(false);
      if (onPhonePrefixChange) onPhonePrefixChange(`+${country.phone}`);
      if (onPhoneCountryChange) onPhoneCountryChange(country.code);
    },
    [onPhonePrefixChange, onPhoneCountryChange],
  );

  const handlePhoneNumberChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPhoneNumber(event.target.value);
      if (onPhoneNumberChange) onPhoneNumberChange(event.target.value);
    },
    [onPhoneNumberChange],
  );

  useImperativeHandle(ref, () => ({
    resetPhoneNumber: () => setPhoneNumber(""),
  }));

  return (
    <div className="flex w-full flex-col">
      <div className="-mx-0.5 flex">
        <div className="relative w-1/3 px-0.5 sm:w-1/3">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`h-10 w-full rounded-l border px-3 ${
              error ? "border-red-500" : "border-gray-300"
            } flex items-center justify-between bg-white`}
          >
            <div className="flex items-center">
              <img
                loading="lazy"
                width="20"
                height="15"
                src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${selectedCountry.code.toUpperCase()}.svg`}
                alt=""
                className="mr-2 hidden sm:block"
              />
              <span>+{selectedCountry.phone}</span>
            </div>
            <svg
              className="hidden h-5 w-5 sm:block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <ul className="absolute z-10 max-h-60 w-full overflow-y-auto rounded-b border border-gray-300 bg-white">
              {countryOptions.map((country) => (
                <li
                  key={country.code}
                  onClick={() => handleCountryChange(country)}
                  className="flex cursor-pointer items-center px-3 py-2 hover:bg-gray-100"
                >
                  <img
                    loading="lazy"
                    width="20"
                    height="15"
                    src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${country.code.toUpperCase()}.svg`}
                    alt=""
                    className="mr-2"
                  />
                  <span>
                    {country.name} (+{country.phone})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-2/3 px-0.5 sm:w-3/4">
          <input
            type="tel"
            placeholder="EX. 0811111111"
            name={name}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            autoComplete="tel"
            className={`h-10 w-full rounded-r border bg-white px-3 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
      </div>
      {helperText && (
        <p
          className={`mt-1 text-sm ${error ? "text-red-500" : "text-gray-600"}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

export default PhoneNumberInput;
