// app/api/calendars/[id]/members/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";

interface Params {
    params: {
        id: string;
    };
}

export async function GET(req: Request, { params }: Params) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Не аутентифицирован" }, { status: 401 });
    }

    const calendarId = params.id;

    // Проверяем, что календарь существует и пользователь имеет доступ
    const calendar = await prisma.calendar.findUnique({
        where: { id: calendarId },
        include: { members: true, owner: true },
    });

    if (!calendar) {
        return NextResponse.json({ error: "Календарь не найден" }, { status: 404 });
    }

    // Проверка доступа: либо владелец, либо член календаря
    const isOwner = calendar.ownerId === session.user.id;
    const isMember = calendar.members.some((m) => m.id === session.user.id);

    if (!isOwner && !isMember) {
        return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    // Возвращаем только участников (members)
    const members = calendar.members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        image: m.image,
    }));

    return NextResponse.json(members);
}
