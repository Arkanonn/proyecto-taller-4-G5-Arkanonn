"use client";
import Link from "next/link";
import { useState } from "react";
import preguntas from "../../data/preguntas.json"

// dirección de botones
let direccion_boton_enviar = "votacion/plantilla";


export default function Quiz() {
  const [respuestas, setRespuestas] = useState({});

  const elegir = (idPregunta, opcion) => {
    setRespuestas({ ...respuestas, [idPregunta]: opcion });
  };

  const quiz_respondido = Object.keys(respuestas).length === preguntas.length;

  return (
    <div className="div_quiz">
      <Link className="bloque_link" href="/">Volver a inicio</Link>
      <h1>CUESTIONARIO</h1>

      {preguntas.map((pregunta) => (
        <div className="bloque" key={pregunta.id}>
          <h2>{pregunta.id}. {pregunta.texto}</h2>
          {pregunta.opciones.map((opcion) => (
            <label className="opcion" key={opcion}>
              <input
                type="radio"
                name={`pregunta-${pregunta.id}`}
                checked={respuestas[pregunta.id] === opcion}
                onChange={() => elegir(pregunta.id, opcion)}
              />
              {opcion}
            </label>
          ))}
        </div>
      ))}

      <div className="bloque">
        {quiz_respondido ? 
        (
          <Link href={direccion_boton_enviar}>
            <button className="btn">Guardar cuestionari</button>
          </Link>
        ) : (
          <button className="btn" disabled>
            Responde todas las preguntas
          </button>
        )}
      </div>
    </div>
  );
}