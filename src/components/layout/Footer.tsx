export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background/95 py-8 text-center text-sm text-foreground/60">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} CyberLaw Simplified. All rights reserved.</p>
        <p className="mt-1">Empowering Indian netizens with cyber law knowledge.</p>
      </div>
    </footer>
  );
}
