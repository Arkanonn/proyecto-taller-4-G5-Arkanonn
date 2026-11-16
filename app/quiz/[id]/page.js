"use client";

import styles from "./QuizPublico.module.css";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function QuizPublico(){
  const {id} = useParams(); // variable que contiene el id
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // variable del token
  const [tokenValido, setTokenValido] = useState(null); // variable de estado del token

  const [quiz, setQuiz] = useState([]);
  const [error, setError] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const router = useRouter();

  // funcion para cargar el quiz
  useEffect(() => {
    // funcion para cargar la informacion de la votacion
    async function cargarQuiz() {
      setQuiz([]);
      setError(null);

      try {
        const respuesta = await fetch(
          `/api/votaciones/${encodeURIComponent(id)}/quiz`
        )
        if (!respuesta.ok){
          throw new Error("No se pudo Cargar el Quiz");
        }
        const datos = await respuesta.json();
        setQuiz(datos);

      } catch (error) {
        setError(error.message);
      }
    }
    // funcion para comprobar el token
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
        setError(error.message)
        setTokenValido(false);
      }
    }

    if (id){
      comprobarToken(); // primero comprueba el token
      cargarQuiz();
    }

  }, [id]);

  // funcion que selecciona las respuestas
  function seleccionarRespuesta(idPregunta, letra){
    setRespuestas({
      ...respuestas,
      [idPregunta]:letra
    });

  }

  async function guardarRespuestas() {
    try {
      const respuestasOrdenadas = quiz.map(
        pregunta => respuestas[pregunta.id] || ""
      );

      const respuesta = await fetch(
        `/api/votaciones/${id}/quiz/respuestas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token,
            respuestas: respuestasOrdenadas
          })
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error);
      }

      return true;

    } catch (error) {
      console.error("Error al guardar respuestas:", error);
      alert("No se pudieron guardar las respuestas.");
      return false;
    }
  }

  // funcion que finalizara el quiz
  async function finalizarQuiz() {

    // Primero guardar las respuestas
    const guardado = await guardarRespuestas();
    
    if (!guardado) return;
    
    // Después marcar el quiz como respondido
    const respuesta = await fetch(
      `/api/votaciones/${id}/quiz/estado`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      }
    );
  
    if (!respuesta.ok) {
      alert("Las respuestas se guardaron, pero no se pudo actualizar el estado del quiz.");
      return;
    }
  
    // Finalmente ir a la votación
    router.push(
      `/votacion/${id}?token=${encodeURIComponent(token)}`
    );
  }

  if(!tokenValido){
    return (
      <div className={styles.body}>
        <h1> Acceso denegado</h1>
      </div>
    )
  }

  return (
    <div className={styles.body}>
      <h1> CUESTIONARIO </h1>

      {error && <p>{error}</p>}
      
      {quiz.map((pregunta) => (
        <div className={styles.bloque} key={pregunta.id}>
          <p> {pregunta.pregunta} </p>
          {pregunta.opciones.map((opcion) => (
            <div key={opcion.letra} >
              <button onClick={() => seleccionarRespuesta(pregunta.id, opcion.letra)}
                className={
                  respuestas[pregunta.id] === opcion.letra
                  ? styles.opcionSeleccionada
                  : styles.opcion
              }
              >
                {opcion.texto}
              </button>
            </div> 
            ))
          }
        </div>
        ))
      }

      <button className={styles.btn} onClick={finalizarQuiz}  disabled={Object.keys(respuestas).length < Object.keys(quiz).length || Object.keys(respuestas).length === 0}>
        Enviar
      </button>

      <h3>Respuestas seleccionadas:</h3>
      <pre>
          {JSON.stringify(respuestas, null, 2)}
      </pre>
      
    </div>
  );
}