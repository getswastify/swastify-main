import React from 'react'
import { motion } from "motion/react"; // ✅ using motion/react lightweight
import Image from "next/image";
const MobileFrame = (props:{isPhone:boolean}) => {
  return (
    <>
          <div className={`relative w-full max-w-md mx-auto ${props.isPhone ? 'lg:hidden' : 'hidden lg:block'}`}>
          {/* Main Portrait Hero Image */}
          <div className="relative w-full aspect-[2/3] overflow-visible">
            <Image
              src="/images/hero-img.png"
              alt="Swastify Healthcare Dashboard"
              width={720}
              height={1080}
              className="w-full h-auto object-contain rounded-2xl shadow-2xl"
            />

            {/* Floating Images with Titles */}
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 3,
                ease: "easeInOut",
              }}
              className="absolute top-15 left-4 flex flex-col items-center">
              <Image
                src="/images/floating1.jpg"
                alt="Doctor Consultation"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="mt-2 text-sm font-bold  text-neutral-300">
                Consultations
              </span>
            </motion.div>

            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 4,
                ease: "easeInOut",
              }}
              className="absolute top-25 right-0 flex flex-col items-center">
              <Image
                src="/images/floating2.jpg"
                alt="Hospital Management"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="mt-2 text-sm font-bold text-neutral-300">
                Telemedicine
              </span>
            </motion.div>

            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 5,
                ease: "easeInOut",
              }}
              className="absolute bottom-20 left-0 flex flex-col items-center">
              <Image
                src="/images/floating3.jpg"
                alt="Health Analytics"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="mt-2 text-sm font-bold text-neutral-300">
                Appointment
              </span>
            </motion.div>

            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 6,
                ease: "easeInOut",
              }}
              className="absolute -bottom-0 right-6 flex flex-col items-center">
              <Image
                src="/images/floating4.jpg"
                alt="Patient Management"
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
              <span className="mt-2 text-sm font-bold text-neutral-300">
                Medical Records
              </span>
            </motion.div>
          </div>
        </div>
    </>
  )
}

export default MobileFrame