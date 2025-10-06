import { Physique57Logo } from './physique57-logo';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Animated Physique 57 Logo */}
            <Physique57Logo size="lg" animated={true} />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Physique 57, Bengaluru
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                x the Studio by Copper + Cloves
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Bengaluru Studio</p>
              <p className="text-xs text-muted-foreground">Indiranagar Location</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}