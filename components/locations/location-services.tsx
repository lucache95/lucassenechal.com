import Link from 'next/link';
import { getAllServices } from '@/lib/data/services';

interface LocationServicesProps {
  city: string;
}

export function LocationServices({ city }: LocationServicesProps) {
  const services = getAllServices();

  return (
    <section className="px-6 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          AI Services Available in {city}
        </h2>
        <div className="space-y-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="block rounded-xl border border-border p-6 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-hover"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{service.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{service.description}</p>
                  <p className="mt-2 text-xs font-medium text-accent">
                    {service.pricing}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
