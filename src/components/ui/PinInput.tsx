import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export function PinInput({ length = 4, onComplete, error = false, disabled = false }: PinInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Clear values on error
    if (error) {
      setValues(Array(length).fill(''));
      inputRefs.current[0]?.focus();
    }
  }, [error, length]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const digit = value.slice(-1); // Take only last character
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    // Move to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (digit && index === length - 1) {
      const pin = newValues.join('');
      if (pin.length === length) {
        onComplete(pin);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      const newValues = Array(length).fill('');
      pastedData.split('').forEach((char, i) => {
        newValues[i] = char;
      });
      setValues(newValues);

      if (pastedData.length === length) {
        onComplete(pastedData);
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {values.map((value, index) => (
        <input
          key={index}
          ref={el => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-14 h-16 text-center text-2xl font-bold
            border-2 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-offset-2
            transition-all duration-200
            ${error
              ? 'border-red-400 bg-red-50 focus:ring-red-500 animate-shake'
              : 'border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label={`PIN digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
