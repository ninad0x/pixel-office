"use client"

export default function CopyLinkButton({ shareCode }: { shareCode: string }) {
  return (
    <button
      onClick={() =>
        navigator.clipboard.writeText(`${window.location.origin}/join/${shareCode}`)
      }
    >
      Copy link
    </button>
  )
}