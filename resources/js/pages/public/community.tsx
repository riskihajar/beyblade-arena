import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    HeartHandshake,
    Info,
    MapPin,
    Shield,
    Sparkles,
    Swords,
    Trophy,
    Users,
} from 'lucide-react';

export default function CommunityPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <Head title="Profil Komunitas & Kode Etik — Beyblade Samarinda" />

            {/* Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>

                    <Button
                        size="sm"
                        render={<Link href="/login">Masuk Blader</Link>}
                    />
                </div>
            </header>

            <main className="container mx-auto max-w-4xl flex-1 space-y-12 px-4 py-10 sm:px-8">
                {/* Hero */}
                <div className="space-y-4 rounded-2xl border bg-linear-to-b from-primary/5 to-background p-6 text-center sm:p-8">
                    <div className="mb-2 inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Users className="size-6" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        Komunitas Beyblade Samarinda (KBS)
                    </h1>
                    <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Wadah persaudaraan, latihan bersama, dan kompetisi
                        turnamen olahraga hobi Beyblade X bagi seluruh blader
                        segala usia di Kota Samarinda dan sekitarnya.
                    </p>
                </div>

                {/* Values & Guidelines */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Pedoman Sportivitas & Kode Etik
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Card className="border shadow-xs">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-primary">
                                    <HeartHandshake className="size-5" />
                                    <span>Sportivitas & Respect</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    Seluruh blader wajib menjunjung tinggi rasa
                                    hormat kepada lawan tanding, wasit
                                    pertandingan, dan sesama penonton turnamen.
                                </p>
                                <p>
                                    Saling berjabat tangan sebelum dan sesudah
                                    setiap sesi pertandingan.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-xs">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-emerald-600">
                                    <Shield className="size-5" />
                                    <span>Keaslian & Legalitas Part</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    Hanya part asli (Original Takara Tomy /
                                    Hasbro) berstandar turnamen yang
                                    diperbolehkan demi keselamatan arena dan
                                    keadilan kompetisi.
                                </p>
                                <p>
                                    Dilarang keras melakukan modifikasi fisik
                                    part (modding/weight addition/illegal
                                    chemical).
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-xs">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-amber-600">
                                    <Sparkles className="size-5" />
                                    <span>Ramah Anak & Keluarga</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    Menjaga lingkungan venue yang aman, ramah
                                    anak, dan bebas dari kata-kata kasar atau
                                    intimidasi.
                                </p>
                                <p>
                                    Peserta kategori Junior U-12 didampingi
                                    orang tua/wali dengan penuh dukungan
                                    positif.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-xs">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base font-bold text-primary">
                                    <CheckCircle2 className="size-5" />
                                    <span>Keputusan Wasit & Head Judge</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    Keputusan juri arena dan Head Judge yang
                                    bertugas bersifat mutlak dan final.
                                </p>
                                <p>
                                    Proses sengketa (dispute) diselesaikan
                                    secara santun melalui jalur investigasi
                                    resmi meja juri.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Legal Disclaimer */}
                <div className="space-y-2 rounded-xl border bg-muted/30 p-6 text-xs text-muted-foreground">
                    <h3 className="flex items-center gap-2 font-bold text-foreground">
                        <Info className="size-4 text-primary" />
                        Pemberitahuan Hak Cipta & Disclaimer
                    </h3>
                    <p className="leading-relaxed">
                        Beyblade, Beyblade X, logo Takara Tomy, dan logo Hasbro
                        adalah merek dagang dan hak cipta milik TOMY Company,
                        Ltd. dan Hasbro, Inc. Platform aplikasi web ini
                        dirancang secara independen oleh Komunitas Blader
                        Samarinda semata-mata untuk memfasilitasi pencatatan
                        skor, manajemen bagan turnamen, dan leaderboard ranking
                        komunitas lokal secara non-profit.
                    </p>
                </div>
            </main>
        </div>
    );
}
