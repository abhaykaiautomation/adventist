"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export interface SignaturePadHandle {
  getDataUrl: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

export const SignaturePad = forwardRef<SignaturePadHandle>(function SignaturePad(_props, ref) {
  const sigRef = useRef<SignatureCanvas>(null);

  useImperativeHandle(ref, () => ({
    getDataUrl: () => {
      if (!sigRef.current || sigRef.current.isEmpty()) return null;
      return sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    },
    clear: () => sigRef.current?.clear(),
    isEmpty: () => sigRef.current?.isEmpty() ?? true,
  }));

  return (
    <div className="rounded-md border bg-white">
      <SignatureCanvas
        ref={sigRef}
        penColor="#111827"
        canvasProps={{ className: "w-full h-40 rounded-md" }}
      />
      <div className="flex justify-end border-t p-2">
        <button
          type="button"
          onClick={() => sigRef.current?.clear()}
          className="text-xs text-blue-700 hover:underline"
        >
          Clear
        </button>
      </div>
    </div>
  );
});
