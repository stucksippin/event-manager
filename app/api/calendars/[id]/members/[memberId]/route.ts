import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import prisma from "@/libs/prisma";

export async function DELETE(
    req: Request,
    context: any, // <- тут ослабили тип
): Promise<NextResponse> {
    const { params } = context as { params: { id: string; memberId: string } };
    const { id: calendarId, memberId } = params;

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Не аутентифицирован" }, { status: 401 });

    const calendar = await prisma.calendar.findUnique({
        where: { id: calendarId },
        include: { members: true },
    });
    if (!calendar) return NextResponse.json({ error: "Календарь не найден" }, { status: 404 });
    if (calendar.ownerId !== session.user.id) return NextResponse.json({ error: "Нет прав" }, { status: 403 });
    if (memberId === calendar.ownerId) return NextResponse.json({ error: "Нельзя удалить владельца" }, { status: 400 });

    await prisma.calendar.update({
        where: { id: calendarId },
        data: { members: { disconnect: { id: memberId } } },
    });

    return NextResponse.json({ success: true });
}
