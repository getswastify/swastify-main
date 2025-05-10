import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const HomeAccordion = () => {
  return (
    <section className="relative z-10 w-full lg:w-[90%] px-4 my-20">
      <div className="max-w-4xl mx-auto text-white">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-12 text-center leading-tight">
          What is Swastify?
        </h2>
        <Accordion
          type="single"
          collapsible
          className="w-full space-y-6"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base md:text-lg lg:text-xl font-semibold">
              What is Swastify?
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base lg:text-lg">
              Swastify is a new digital healthcare platform that’s currently in development. Right now, you can book appointments with doctors online. We’re adding more features soon!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-base md:text-lg lg:text-xl font-semibold">
              What features are available right now?
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base lg:text-lg">
              You can currently book appointments with doctors through the platform. We’re working on adding more features like online consultations, doctor search, and language support.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-base md:text-lg lg:text-xl font-semibold">
              Is Swastify fully functional yet?
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base lg:text-lg">
              Not yet! While we’ve released appointment booking, we’re still in the development phase. More features, including video consultations and advanced search, will be coming soon.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-base md:text-lg lg:text-xl font-semibold">
              Can I use Swastify to book appointments now?
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base lg:text-lg">
              Yes! You can book doctor appointments right now through Swastify, which is the feature currently available.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-base md:text-lg lg:text-xl font-semibold">
              When will new features be added to Swastify?
            </AccordionTrigger>
            <AccordionContent className="text-sm md:text-base lg:text-lg">
              We are actively developing new features and plan to roll them out soon. Stay tuned for updates on online consultations, doctor search, and more!
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}

export default HomeAccordion
