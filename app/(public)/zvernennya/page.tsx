import Link from "next/link";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { ComplaintIcon } from "@/components/icons";

export default function ZvernennyaPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-200 text-primary-600">
            <ComplaintIcon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Подати звернення
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Без реєстрації — опишіть ситуацію, і диспетчер розгляне її у
            встановлений законом строк.
          </p>
        </div>
        <Link
          href="/zvernennya/status"
          className="mt-1 shrink-0 text-sm font-medium text-primary-700 hover:underline"
        >
          Перевірити статус →
        </Link>
      </header>
      <div className="card p-5 sm:p-6">
        <ComplaintForm />
      </div>
    </main>
  );
}
