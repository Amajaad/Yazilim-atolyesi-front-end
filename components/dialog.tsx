"use client";
import { useId, useRef } from "react";
import { Icon } from "./icon";
export function Dialog({
  label,
  title,
  children,
  className = "text-button",
}: {
  label: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => ref.current?.showModal()}
      >
        {label}
      </button>
      <dialog
        className="club-dialog"
        ref={ref}
        aria-labelledby={id}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const b = e.currentTarget.getBoundingClientRect();
            if (
              e.clientX < b.left ||
              e.clientX > b.right ||
              e.clientY < b.top ||
              e.clientY > b.bottom
            )
              ref.current?.close();
          }
        }}
      >
        <div className="dialog-heading">
          <h2 id={id}>{title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Pencereyi kapat"
            onClick={() => ref.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}
