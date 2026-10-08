import React, { useState } from "react";

/**
 * TagInput — renders a list of tag chips with an inline text field.
 * Props: tags (string[]), onChange (fn), placeholder (string)
 */
export default function TagInput({ tags = [], onChange, placeholder = "Type and press Enter…" }) {
  const [value, setValue] = useState("");

  const addTag = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    // Avoid duplicates
    if (!tags.map((t) => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setValue("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(value);
    } else if (e.key === "Backspace" && !value && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (idx) => onChange(tags.filter((_, i) => i !== idx));

  return (
    <div
      className="tag-input-wrapper"
      onClick={() => document.getElementById(`tag-input-${placeholder}`)?.focus()}
    >
      {tags.map((tag, i) => (
        <span key={i} className="tag">
          {tag}
          <button type="button" className="tag-remove" onClick={() => removeTag(i)} aria-label="remove">
            ×
          </button>
        </span>
      ))}
      <input
        id={`tag-input-${placeholder}`}
        className="tag-input-field"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => addTag(value)}
        placeholder={tags.length === 0 ? placeholder : ""}
      />
    </div>
  );
}
