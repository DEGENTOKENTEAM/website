import Image from 'next/image'
import logoImage from './../../../images/logo_large.png'
import translations from './../../../translations/site.json'

export function Footer() {
    return (
        <footer className="flex flex-col gap-8 p-16">
            <div>
                <Image className="mx-auto h-10 w-auto" src={logoImage} alt="" width={56} height={56} />
            </div>
            <p className="text-center text-dapp-cyan-50/50">
                {translations.footer.copyright.en} 🥦 {new Date().getFullYear()} {translations.footer.reservedRights.en}
            </p>
        </footer>
    )
}
