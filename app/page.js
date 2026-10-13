"Use client"
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

// dirección de botones 
let direccion_boton_crear = "crear";
let direccion_boton_quiz = "quiz";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className="div_main">
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <h1>
          Titulo Principal
        </h1>
        <div className="div_home">

            <Link className="bloque_link" href={direccion_boton_crear}> crear
            </Link>

            <Link className="bloque_link" href={direccion_boton_quiz}> votacion </Link>
          
        </div>
          
      </main>
    </div>
  );
}
