"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "./page.module.css";


export default function Home() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [eleccionId, setEleccionId] = useState("");

  function ingresar() {

    if (!token.trim() || !eleccionId.trim()) {
        alert("Debes completar ambos campos");
        return;
    }

    router.push(
        `/votacion/${eleccionId}?token=${encodeURIComponent(token)}`
    );

  }

  return (
    <div className={styles.body}>
      <h1> HOME </h1>
      <div className={styles.contenedor}>
        <input
            placeholder="INGRESA TU TOKEN"
            value={token}
            onChange={(e) => setToken(e.target.value)}
        />

        <input 
        placeholder="INGRESA EL ID DE LA ELECCION" 
        value={eleccionId}
        onChange={(e) => setEleccionId(e.target.value)}
        />
        
        <button onClick={ingresar}> Ir</button>
      </div>
      
    </div>
  );
}
