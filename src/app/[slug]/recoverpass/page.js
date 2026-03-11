'use client'
import RecoverPassFrom from "@/modules/eventos/components/RecoverPassFrom";
import { useParams } from 'next/navigation';

export default function RecoverPassPage() {
    const params = useParams();
    const slug = params.slug;
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <RecoverPassFrom redirectPath={`/${slug}/login`} />
        </div>
    )
}