import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string; memberId: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Не аутентифицирован" }, { status: 401 });
    }

    const { id: calendarId, memberId } = params;

    // Проверяем календарь
    const calendar = await prisma.calendar.findUnique({
        where: { id: calendarId },
        include: { members: true },
    });

    if (!calendar) {
        return NextResponse.json({ error: "Календарь не найден" }, { status: 404 });
    }

    if (calendar.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Нет прав" }, { status: 403 });
    }

    // Владелец не может удалить сам себя
    if (memberId === calendar.ownerId) {
        return NextResponse.json({ error: "Нельзя удалить владельца" }, { status: 400 });
    }

    // Удаляем участника
    await prisma.calendar.update({
        where: { id: calendarId },
        data: {
            members: {
                disconnect: { id: memberId },
            },
        },
    });

    return NextResponse.json({ success: true });
}
