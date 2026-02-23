"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface SmartInputProps {
  type: "buttons" | "text" | "slider" | "multi-select";
  options?: string[];
  sliderConfig?: { min: number; max: number; step: number; labels: [string, string] };
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

export function SmartInput({
  type,
  options = [],
  sliderConfig,
  placeholder,
  value,
  onChange,
  onSubmit,
}: SmartInputProps) {
  // ── Buttons ────────────────────────────────────────────────────
  if (type === "buttons") {
    return (
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-wrap justify-center gap-3"
      >
        {options.map((option) => (
          <button
            key={option}
            onClick={() => {
              onChange(option);
              // Auto-advance after a brief visual feedback
              setTimeout(() => onSubmit(), 150);
            }}
            className={`
              rounded-lg border px-5 py-3 text-sm font-medium transition-all duration-200
              cursor-pointer
              ${
                value === option
                  ? "border-accent bg-accent text-accent-foreground shadow-sm shadow-accent/20"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover hover:border-accent/40"
              }
            `.trim()}
          >
            {option}
          </button>
        ))}
      </motion.div>
    );
  }

  // ── Text ───────────────────────────────────────────────────────
  if (type === "text") {
    return <TextInput value={value} onChange={onChange} onSubmit={onSubmit} placeholder={placeholder} />;
  }

  // ── Slider ─────────────────────────────────────────────────────
  if (type === "slider" && sliderConfig) {
    return (
      <SliderInput
        config={sliderConfig}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    );
  }

  // ── Multi-select ───────────────────────────────────────────────
  if (type === "multi-select") {
    return (
      <MultiSelectInput
        options={options}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    );
  }

  return null;
}

// ── Text sub-component ───────────────────────────────────────────

function TextInput({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="w-full max-w-lg mx-auto"
    >
      <textarea
        ref={textareaRef}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type your answer..."}
        className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors duration-200"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Press Enter to continue (Shift+Enter for new line)
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={onSubmit}
          disabled={!value.trim()}
        >
          Next
        </Button>
      </div>
    </motion.div>
  );
}

// ── Slider sub-component ─────────────────────────────────────────

function SliderInput({
  config,
  value,
  onChange,
  onSubmit,
}: {
  config: { min: number; max: number; step: number; labels: [string, string] };
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const numericValue = value ? Number(value) : Math.round((config.min + config.max) / 2);

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="w-full max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted">{config.labels[0]}</span>
        <span className="text-lg font-semibold text-foreground">
          {numericValue}
        </span>
        <span className="text-xs text-muted">{config.labels[1]}</span>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={numericValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 rounded-full appearance-none bg-surface-active accent-accent cursor-pointer"
      />
      <div className="mt-4 flex justify-center">
        <Button variant="primary" size="sm" onClick={() => {
          if (!value) onChange(String(numericValue));
          onSubmit();
        }}>
          Next
        </Button>
      </div>
    </motion.div>
  );
}

// ── Multi-select sub-component ───────────────────────────────────

function MultiSelectInput({
  options,
  value,
  onChange,
  onSubmit,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  // Value stored as comma-separated string
  const selected = value ? value.split(",").filter(Boolean) : [];

  const toggle = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(updated.join(","));
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="w-full max-w-lg mx-auto"
    >
      <div className="flex flex-wrap justify-center gap-3">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              onClick={() => toggle(option)}
              className={`
                rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200
                cursor-pointer
                ${
                  isSelected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface text-foreground hover:bg-surface-hover hover:border-accent/40"
                }
              `.trim()}
            >
              {isSelected && (
                <span className="mr-1.5">&#10003;</span>
              )}
              {option}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-center">
        <Button
          variant="primary"
          size="sm"
          onClick={onSubmit}
          disabled={selected.length === 0}
        >
          Continue ({selected.length} selected)
        </Button>
      </div>
    </motion.div>
  );
}

export default SmartInput;
