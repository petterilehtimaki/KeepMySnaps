"use client";

import { useRouter } from "next/navigation";
import { scrollToChooseFile } from "./SaveChoice";
import { buttonClass } from "./ui";

/**
 * "Save my memories": takes you to the uploader, nothing more.
 *
 * The test-first-or-pay question is asked by the uploader's Choose file button
 * (SaveChoice), at the moment someone actually picks their ZIP.
 */

type Props = {
  size?: "sm" | "md";
  className?: string;
};

export default function SaveButton({ size = "md", className = "" }: Props) {
  const router = useRouter();

  const goToUploader = () => {
    if (window.location.pathname === "/") {
      // Already on the page. Pushing the same hash again wouldn't scroll.
      scrollToChooseFile();
      history.replaceState(null, "", "/#upload");
    } else {
      router.push("/#upload");
    }
  };

  return (
    <button
      type="button"
      onClick={goToUploader}
      className={buttonClass({ size, className })}
    >
      Save my memories
    </button>
  );
}
