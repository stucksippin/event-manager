// app/api/calendars/[id]/members/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // <- params как Promise
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Не аутентифицирован" }, { status: 401 });
    }

    const { id: calendarId } = await params; // <- обязательно await

    const calendar = await prisma.calendar.findUnique({
        where: { id: calendarId },
        include: { members: true, owner: true },
    });

    if (!calendar) {
        return NextResponse.json({ error: "Календарь не найден" }, { status: 404 });
    }

    const isOwner = calendar.ownerId === session.user.id;
    const isMember = calendar.members.some((m) => m.id === session.user.id);

    if (!isOwner && !isMember) {
        return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const members = calendar.members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        image: m.image,
    }));

    return NextResponse.json(members);
}
