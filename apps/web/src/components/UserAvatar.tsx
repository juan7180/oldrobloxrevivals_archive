import Image from "next/image";
import { getDefaultAvatarSrc } from "@/lib/avatar";

export function UserAvatar({
  username,
  size = 32,
}: {
  username: string;
  size?: number;
}) {
  const src = getDefaultAvatarSrc(username);

  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden bg-reddit-bg"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={`${size}px`}
        className="object-cover"
        aria-hidden
      />
    </div>
  );
}
