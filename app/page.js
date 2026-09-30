"Use client"
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

let direccion_boton_crear = "crear";
let direccion_boton_unirse = "unirse";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
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
        <div>
          <Link href={direccion_boton_crear}> Crear </Link>
        </div>
        <div>
          <Link href={direccion_boton_unirse}> Unirse </Link>
        </div>
        <div>
          <Link href={"votacion"}> votacion </Link>
        </div>
      </main>
    </div>
  );
}
