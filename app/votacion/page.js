"use client"
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function votacion(){
  // variable para ver si una opción fue seleccionada y la función que la altera
  const [seleccionada, setSeleccionada] = useState(null);

  // 
  const [votacion, setVotacion] = useState(null);

  useEffect(() => {
    async function cargarVotaciones() {
      const respuesta = await fetch("/api/votaciones");
      const datos = await respuesta.json();

      console.log(datos);

      setVotacion(datos);
    }

    cargarVotaciones();
  }, []);

  if (votacion === null) {
    return <h2>Cargando...</h2>
  }

  return (
    <div >
      {/* botón para ir a home*/ }
      <Link className="bloque_link"href={"../"}>Home</Link>

      <h1> Titulo Página de votación </h1>

      <h2>{votacion.nombre}</h2>
      {votacion.listas.map((lista) => (
        <div className="bloque" key={lista.id}>
        <h2>{lista.nombre}</h2>
        <h3> Integrantes </h3>
        { lista.integrantes.map((i,j) => (
          <div key={lista.id+1*j}>{i}</div>
        ))}
        <input type="checkbox" checked={seleccionada === lista.id} onChange={() => setSeleccionada(lista.id)}/>
        </div>
      ))}
      
      <div className="bloque">
        {seleccionada ? 
        (
          <Link href={"../"}>
            <button className="btn">Enviar votación</button>
          </Link>
        ) : (
          <button className="btn" disabled>
            Selecciona un postulante
          </button>
        )}
      </div>

    </div>
  )
}