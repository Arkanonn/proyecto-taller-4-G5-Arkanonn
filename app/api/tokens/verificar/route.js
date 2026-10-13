import { verificarToken } from "@/lib/tokens";

export async function POST(request) {
    try {
        const { eleccionId, token } = await request.json();

        const valido = await verificarToken(
            eleccionId,
            token
        );

        return Response.json({
            valido
        });

    } catch (error) {
        console.error("Error al verificar token:", error);

        return Response.json(
            { error: "No se pudo verificar el token" },
            { status: 500 }
        );
    }
}