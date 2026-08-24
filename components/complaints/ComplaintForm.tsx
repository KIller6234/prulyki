"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  complaintFormSchema,
  COMPLAINT_TYPE_LABELS,
  type ComplaintFormValues,
} from "@/lib/validation/complaintForm";
import { PhotoUploader } from "./PhotoUploader";
import type { ComplaintCreateResult } from "@/app/api/zvernennya/route";
import type { ApiResponse } from "@/types/api";

interface SubmitState {
  status: "idle" | "submitting" | "success" | "error";
  errorMessage?: string;
  result?: ComplaintCreateResult;
}

export function ComplaintForm() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      type: "COMPLAINT",
      personalDataConsent: false,
    },
  });

  const handleUseMyLocation = () => {
    setLocationError(null);
    if (!("geolocation" in navigator)) {
      setLocationError("Геолокація не підтримується цим браузером");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => setLocationError("Не вдалося визначити місцезнаходження"),
    );
  };

  const onSubmit = async (values: ComplaintFormValues) => {
    setSubmitState({ status: "submitting" });

    const formData = new FormData();
    formData.set("type", values.type);
    formData.set("subject", values.subject);
    formData.set("description", values.description);
    if (values.addressText) formData.set("addressText", values.addressText);
    formData.set("applicantName", values.applicantName);
    if (values.applicantPhone)
      formData.set("applicantPhone", values.applicantPhone);
    if (values.applicantEmail)
      formData.set("applicantEmail", values.applicantEmail);
    formData.set(
      "personalDataConsent",
      values.personalDataConsent ? "true" : "false",
    );
    if (coords) {
      formData.set("lat", String(coords.lat));
      formData.set("lng", String(coords.lng));
    }
    for (const photo of photos) {
      formData.append("attachments", photo);
    }

    try {
      const response = await fetch("/api/zvernennya", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as ApiResponse<ComplaintCreateResult>;

      if (!body.success || !body.data) {
        setSubmitState({
          status: "error",
          errorMessage: body.error ?? "Не вдалося подати звернення",
        });
        return;
      }

      setSubmitState({ status: "success", result: body.data });
      reset();
      setPhotos([]);
      setCoords(null);
    } catch {
      setSubmitState({
        status: "error",
        errorMessage: "Помилка мережі. Спробуйте ще раз.",
      });
    }
  };

  if (submitState.status === "success" && submitState.result) {
    return (
      <div className="rounded-2xl bg-mint-100 p-6 text-center">
        <p className="text-lg font-semibold text-primary-900">
          Звернення зареєстровано
        </p>
        <p className="mt-2 text-2xl font-bold text-primary-800">
          {submitState.result.registrationNumber}
        </p>
        <p className="mt-2 text-sm text-primary-700">
          Збережіть цей номер — за ним можна перевірити статус розгляду на
          сторінці{" "}
          <a href="/zvernennya/status" className="underline">
            Перевірка статусу
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setSubmitState({ status: "idle" })}
          className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-primary-800 shadow-sm hover:bg-primary-50"
        >
          Подати ще одне звернення
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Вид звернення
        </label>
        <select
          {...register("type")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
        >
          {Object.entries(COMPLAINT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Тема
        </label>
        <input
          {...register("subject")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          placeholder="Наприклад: переповнений контейнер"
        />
        {errors.subject ? (
          <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Опис
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          placeholder="Опишіть ситуацію детальніше"
        />
        {errors.description ? (
          <p className="mt-1 text-xs text-red-600">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Адреса
        </label>
        <input
          {...register("addressText")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          placeholder="Вулиця, будинок"
        />
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="mt-1 text-xs font-medium text-primary-700 hover:underline"
        >
          Або вказати точку на мапі за моєю геопозицією
        </button>
        {coords ? (
          <p className="mt-1 text-xs text-gray-500">
            Координати додано: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        ) : null}
        {locationError ? (
          <p className="mt-1 text-xs text-red-600">{locationError}</p>
        ) : null}
      </div>

      <PhotoUploader files={photos} onChange={setPhotos} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ПІБ
          </label>
          <input
            {...register("applicantName")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          />
          {errors.applicantName ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.applicantName.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Телефон
          </label>
          <input
            {...register("applicantPhone")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
            placeholder="+380..."
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Електронна пошта
        </label>
        <input
          {...register("applicantEmail")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
        />
        {errors.applicantPhone ? (
          <p className="mt-1 text-xs text-red-600">
            {errors.applicantPhone.message}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" {...register("personalDataConsent")} className="mt-0.5" />
        <span>
          Даю згоду на обробку персональних даних відповідно до Закону
          України «Про захист персональних даних» з метою розгляду цього
          звернення.
        </span>
      </label>
      {errors.personalDataConsent ? (
        <p className="text-xs text-red-600">
          {errors.personalDataConsent.message}
        </p>
      ) : null}

      {submitState.status === "error" ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitState.errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitState.status === "submitting"}
        className="w-full rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {submitState.status === "submitting"
          ? "Надсилання…"
          : "Подати звернення"}
      </button>
    </form>
  );
}
