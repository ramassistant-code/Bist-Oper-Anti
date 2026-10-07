import { getQuoteBySigningToken } from "@/lib/services/quotes";
import { notFound } from "next/navigation";
import { SigningClientView } from "./client-view";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SignPage({ params }: Props) {
  const resolvedParams = await params;
  const quoteData = await getQuoteBySigningToken(resolvedParams.token);

  if (!quoteData) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-rose-400">הצעה לא נמצאה</h2>
        <p className="text-xs text-slate-400">
          קישור החתימה אינו תקין או שההצעה הוסרה. נא לפנות לצוות הסטודיו.
        </p>
      </div>
    );
  }

  return <SigningClientView token={resolvedParams.token} quoteData={quoteData} />;
}
