
export async function GET() {
  const votacion = 
    {
      id: 1,
      nombre: "Centro de Estudiantes",
      listas: [
        {
          id: 1,
          nombre: "Lista A",
          integrantes: ["Ana", "Pedro", "Carlos"]
        },
        {
          id: 2,
          nombre: "Lista B",
          integrantes: ["María", "Juan", "Sofía"]
        }
      ]
    }
  ;

  return Response.json(votacion);
}
