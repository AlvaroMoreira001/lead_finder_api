'use client';

export function PageHeader() {
  return (
    <header className="text-center pb-6 mb-6 border-b border-border">
      <h1 className="font-heading font-extrabold text-3xl md:text-4xl lg:text-[2.8rem] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Lead Finder
      </h1>
      <p className="text-muted-foreground mt-2 text-sm md:text-base">
        Encontre e enriqueça leads do Google automaticamente
      </p>
    </header>
  );
}
