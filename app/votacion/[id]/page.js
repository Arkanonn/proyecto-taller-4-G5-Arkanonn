"use client"
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Votacion() {
  // obtener el id desde el url
  const { id } = useParams();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  // variable para ver si una opción fue seleccionada y la función que la altera
  const [seleccionada, setSeleccionada] = useState(null);
  
  // variable para ver si se esta enviando el voto y la función que la altera
  const [enviando, setEnviando] = useState(false);
  
  // variable para ver si el voto fue confirmado y la función que la altera
  const [votoConfirmado, setVotoConfirmado] = useState(false);
  
  // variable para ver si hubo un error al enviar el voto y la función que la altera
  const [errorEnvio, setErrorEnvio] = useState("");

  // datos de la votacion
  const [votacion, setVotacion] = useState(null);
  
  // estado para controlar errores
  const [error, setError] = useState(null);
  
  // router para navegar entre paginas
  const router = useRouter();

  // variable que verifica si el token es valido
  const [tokenValido, setTokenValido] = useState(null);
  
  // cargador de votaciones
  useEffect(() => {
    async function cargarVotaciones() {
      setVotacion(null);
      setError(null);
      setSeleccionada(null);

      try {
        const respuesta = await fetch(
          `/api/votaciones/${encodeURIComponent(id)}`
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo cargar la votación");
        }
        const datos = await respuesta.json();

        setVotacion(datos);
      } catch (error) {
        setError(error.message);
      }
    }

    if (id) {
      cargarVotaciones();
    }
  }, [id]);

  useEffect(() => {
    async function comprobarToken() {
      setTokenValido(null);

      if (!token) {
        setTokenValido(false);
        return;
      }

      try {
        const respuesta = await fetch("/api/tokens/verificar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            eleccionId: Number(id),
            token: token
          })
        });
        if (!respuesta.ok) {
          throw new Error("Error al verificar el token");
        }
        const datos = await respuesta.json();
        setTokenValido(datos.valido);
      } 
      catch (error) {
        console.error(error);
        setTokenValido(false);
      }
    }

    if (id) {
      comprobarToken();
    }
  }, [id, token]);

  // si el voto fue confirmado, mostrar mensaje de confirmación
  if (votoConfirmado) {
    return (
      <div className="votacion" style={{
        textAlign: "center",
        padding: "60px 20px"
      }}>
        <h1>¡Voto registrado correctamente!</h1>

        <p>
          Tu voto ha sido guardado exitosamente.
        </p>

        <p>
          Este enlace ya no puede volver a utilizarse.
        </p>

        <Link className="bloque_link" href="/">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (error) {
    return <h2>{error}</h2>
  }
  
  // mientras obtiene la informacion
  if (votacion === null) {
    return <h2>Cargando...</h2>
  }

  // verifica el token
  if (tokenValido === null) {
    return <h2>Verificando autorización...</h2>;
  }
  
  // si el token es invalido
  if (tokenValido === false) {
    return (
      <div className="votacion">
        <h1>Acceso denegado</h1>
        <p>El enlace de votación no es válido o ya fue utilizado.</p>
        <Link href="/">Volver al inicio</Link>
      </div>
    );
  }

  if (votacion.estado === "pendiente") {
    return (
      <div className="votacion">
        <h1>{votacion.nombre}</h1>
        <h2>La votación todavía no comienza</h2>
        <p>Fecha de inicio: {new Date(votacion.FechaInicio).toLocaleString("es-CL")}</p>
        <Link href="/">Volver al inicio</Link>
      </div>
    );
  }

  if (votacion.estado === "finalizada") {
    return (
      <div className="votacion">
        <h1>{votacion.nombre}</h1>
        <h2>La votación ha finalizado</h2>
        <Link href="/">Volver al inicio</Link>
      </div>
    );
  }

  if (votacion.estado !== "activa") {
    return <h2>La votación no está disponible.</h2>;
  }

  // funcion del boton enviar modificada para enviar el voto a la api
  async function enviarVoto() {
    if (
      seleccionada === null ||
      enviando ||
      votoConfirmado ||
      tokenValido !== true
    ) return;

    const confirmar = window.confirm(
      "¿Estás seguro de emitir tu voto? No podrás cambiarlo después."
    );

    if (!confirmar) return;

    setEnviando(true);
    setErrorEnvio("");

    try {
      const respuesta = await fetch(
        `/api/votaciones/${encodeURIComponent(id)}/votar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: token,
            listaId: seleccionada
          })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error || "No se pudo registrar el voto"
        );
      }

      setVotoConfirmado(true);

    } catch (error) {
      console.error("Error al votar:", error);
      setErrorEnvio(error.message);
    } finally {
      setEnviando(false);
    }
  }

  // si todo salio bien mostrara esto
  return (
    <div className="votacion">
      {/* botón para ir a home*/ }
      <Link className="bloque_link" href={"/"}>Home</Link>

      <h1>{votacion.nombre}</h1>
      <h2>Fecha Inicio: {new Date(votacion.FechaInicio).toLocaleString("es-CL")} | Fecha Termino: {new Date(votacion.FechaTermino).toLocaleString("es-CL")}</h2>
      
      <h2>Listas</h2>
      <div className="contenedor_opciones">
        {votacion.listas.map((lista) => (
          <div className="contenedor_opcion" key={lista.id}>
            <div className="contenedor_opcion_h2"><h2>{lista.nombreLista}</h2></div>
              
            <div className="contenedor_opcion_descripcion"><p>{lista.descripcion}</p></div>

            <div className="contenedor_opcion_integrantes">
              <h2>Integrantes:</h2>
              <ul>
                {lista.integrantes.map((i, indice) => (
                  <li key={indice}>{i}</li>
                ))}
              </ul>
            </div>
            
            <div className="contenedor_opcion_marcador">
              <input type="checkbox" checked={seleccionada === lista.id} onChange={() => setSeleccionada(seleccionada === lista.id ? null : lista.id)}/>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn_votacion"
        onClick={enviarVoto}
        disabled={seleccionada === null || enviando}
      >
        {enviando
          ? "Registrando voto..."
          : seleccionada === null
          ? "Selecciona una lista"
          : "Enviar votación"}
      </button>

      {errorEnvio && (
        <p
          role="alert"
          style={{
            color: "darkred",
            textAlign: "center",
            marginTop: "15px"
          }}
        >
          {errorEnvio}
        </p>
      )}
    </div>
  )
}