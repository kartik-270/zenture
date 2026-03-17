import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is my data confidential?",
    answer: "Yes, we prioritize your privacy and ensure that all data is securely encrypted. Your personal information and conversations are protected with industry-standard security measures."
  },
  {
    question: "How do I book a session?",
    answer: "You can book an appointment with a counsellor through our confidential online booking system. Simply navigate to the Appointments page, select a counsellor, choose a date and time, and confirm your booking."
  },
  {
    question: "Can I talk to someone anonymously?",
    answer: "Yes, you can access support groups and chat with our AI assistant without revealing your identity. The peer support forums also allow for anonymous participation."
  },
  {
    question: "What if I'm not sure what I'm feeling?",
    answer: "Our self-assessment tools can help you understand and identify your emotions. Take standardized tests like PHQ-9 for depression or GAD-7 for anxiety to get insights into your mental well-being."
  },
  {
    question: "How do I join the peer support group?",
    answer: "You can sign up through the Community tab. Once verified, you'll be matched with trained student volunteers and can join moderated forums to share experiences and support each other."
  },
  {
    question: "Are the resources culturally sensitive?",
    answer: "Yes, we provide content that respects and reflects diverse cultural backgrounds and languages. Our psychoeducation hub includes materials tailored to various cultural contexts."
  },
  {
    question: "Can I access support in my regional language?",
    answer: "Yes, you can access support in regional languages like Hindi, Tamil, and others based on institutional and user preferences. We're continuously expanding our language support."
  },
  {
    question: "Is there a cost for using Zenture?",
    answer: "Zenture is provided free of charge to students through participating institutions. All core features including counseling, self-assessments, and community support are available at no cost."
  },
]

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen gradient-bg py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions about Zenture Wellness
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left font-medium text-card-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions?
            </p>
            <a
              href="mailto:support@zenture.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
