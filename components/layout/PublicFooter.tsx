import Link from "next/link";
import { OpenChatLink } from "@/components/chat/OpenChatLink";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-gray-500">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="font-bold text-primary-600">Чисті Прилуки</p>
            <p className="mt-1">
              Вебплатформа управління побутовими відходами Прилуцької
              міської територіальної громади.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Розділи</p>
            <ul className="mt-1 space-y-1">
              <li><Link href="/mapa" className="hover:text-primary-600">Мапа майданчиків</Link></li>
              <li><Link href="/grafik" className="hover:text-primary-600">Графіки вивезення</Link></li>
              <li><Link href="/zvernennya" className="hover:text-primary-600">Звернення</Link></li>
              <li><OpenChatLink className="hover:text-primary-600" /></li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-700">Контакти Оператора</p>
            <p className="mt-1">
              Контактні дані диспетчерської буде додано адміністратором
              Системи.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
