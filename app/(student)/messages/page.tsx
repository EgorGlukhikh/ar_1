import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MessengerClient } from "@/components/messages/messenger-client";

export default async function MessagesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Get unique conversations
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get admins/curators for new conversations
  const staff = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "CURATOR", "AUTHOR"] },
      id: { not: session.user.id },
    },
    select: { id: true, name: true, role: true, image: true },
  });

  return (
    <MessengerClient
      currentUserId={session.user.id}
      messages={JSON.parse(JSON.stringify(messages))}
      staff={staff}
    />
  );
}
