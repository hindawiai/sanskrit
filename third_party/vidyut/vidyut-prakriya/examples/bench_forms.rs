use vidyut_prakriya::args::*;
use vidyut_prakriya::Vyakarana;

fn main() {
    let v = Vyakarana::new();
    let cases = [
        ("BU", Gana::Bhvadi, Lakara::Lat, "Bavati"),
        ("gam", Gana::Bhvadi, Lakara::Lat, "gacCati"),
    ];
    for (upadesha, gana, lakara, expected) in cases {
        let slp = Slp1String::try_from(upadesha).expect("slp1");
        let dhatu = Dhatu::mula(slp, gana);
        let args = Tinanta::builder()
            .dhatu(dhatu)
            .lakara(lakara)
            .prayoga(Prayoga::Kartari)
            .purusha(Purusha::Prathama)
            .vacana(Vacana::Eka)
            .build()
            .unwrap();
        let prakriyas = v.derive_tinantas(&args);
        let got = prakriyas.first().map(|p| p.text()).unwrap_or_default();
        println!("{upadesha}\t{expected}\t{got}\t{}", if got == expected { "ok" } else { "diff" });
    }
}
