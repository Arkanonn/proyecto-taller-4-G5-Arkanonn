"use client"
import Image from "next/image";
import Link from "next/link";
import listas from "../../data/votaciones.json"
import { useState } from "react";

export default function Home(){
  // variable para ver si una opcion fue seleccionada y la funcion que la altera
  const [seleccionada, setSeleccionada] = useState(null);
  return (
    <div >
      {/* boton para ir a home*/ }
      <Link href={"../"}>Home</Link>
      <h1> Titulo Pagina de votacion </h1>
      {
        // funcion que ira opcion por opcion tomando sus datos poniendolas en el div
        listas.map((e,i) => {
          return (
            <div className="contenedor_opciones" key={i}>
              <div>identificador</div>
              {e.id}

              <div>Lista</div>
              {e.nombre}

              <div>Propuesta</div>
              {e.descripcion}
              <div></div>
              <input type="checkbox"
              checked={seleccionada === e.id}
              onChange={() => setSeleccionada(e.id)}
              />
            </div>  
          )
        })
      }
      <button >
        Guardar
      </button>

    </div>
  )
}