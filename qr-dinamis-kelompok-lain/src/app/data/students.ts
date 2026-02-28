// Database mahasiswa — NIM sebagai username, password = NIM
export interface Student {
    nim: string;
    nama: string;
}

export const STUDENTS: Student[] = [
    { nim: "434231001", nama: "CINDY ALFIRA" },
    { nim: "434231006", nama: "ADITYA PRATAMA" },
    { nim: "434231007", nama: "NOGA SALSABILLA ALALFALA" },
    { nim: "434231008", nama: "ESALINA PRISA WANUDIA" },
    { nim: "434231012", nama: "REVIKA AMELINDA FEFTYANA" },
    { nim: "434231013", nama: "WAFI HUSNA SALSABILA" },
    { nim: "434231014", nama: "NOOR FARIHA FATHMAWATY" },
    { nim: "434231015", nama: "DHAFINA BENING NAJWA BRILLIAN" },
    { nim: "434231017", nama: "MUHAMMAD FAIDZIN ASLAM" },
    { nim: "434231018", nama: "SAFRIZAL HUDA KURNIAWAN" },
    { nim: "434231019", nama: "FELICIA PARAMDAYANI AIDILYA PUTRI" },
    { nim: "434231022", nama: "ABDUL ALIM" },
    { nim: "434231023", nama: "ELIA SARI" },
    { nim: "434231025", nama: "MUHAMMAD ZAKY IRLY ALQIFARI" },
    { nim: "434231026", nama: "DANIEL SITUMORANG" },
    { nim: "434231028", nama: "AKBAR ZAHRON JIWA YANU" },
    { nim: "434231029", nama: "PANJI BACHTIAR" },
    { nim: "434231031", nama: "MUHAMMAD DUTA ZAINUL HAKIM" },
    { nim: "434231033", nama: "AHMAD LAZIM" },
    { nim: "434231035", nama: "KAMILATUS SA'ADAH" },
    { nim: "434231037", nama: "FIKRI ARDIANSYAH" },
    { nim: "434231038", nama: "ADINDA RIZKI AMALIYAH" },
    { nim: "434231040", nama: "ALERON MAULANA FIRJATULLAH" },
    { nim: "434231047", nama: "DIVA DWI BERENZA" },
    { nim: "434231050", nama: "NUR AZIZAH FITRIA" },
    { nim: "434231051", nama: "MUHAMMAD ALIF ADIAWAN" },
    { nim: "434231053", nama: "ABDILLAH MUHARRARUL WIBOWO" },
    { nim: "434231057", nama: "DZIKRI HIDAYAT" },
    { nim: "434231063", nama: "INUNK RODLIYAH" },
    { nim: "434231064", nama: "AFFAN RIDO HARRIS BERLIANSYAH" },
    { nim: "434231065", nama: "ANDINO FERDIANSAH" },
    { nim: "434231067", nama: "KENZIE MAULANA HUGO AURICH" },
    { nim: "434231068", nama: "AYUNDA RISKI NURVIANA" },
    { nim: "434231069", nama: "NINDHARY ENDRIYA" },
    { nim: "434231070", nama: "NABILA RAHMASARI" },
    { nim: "434231071", nama: "ANANDA NOUVAL ARYANTA" },
    { nim: "434231073", nama: "SUTANTIYAR DWIPUTRA" },
    { nim: "434231076", nama: "MOH. SEFRY AUDITYA IZZA EFENDI" },
    { nim: "434231077", nama: "ARYA MAULANA" },
    { nim: "434231078", nama: "AHLUL MUFI" },
    { nim: "434231079", nama: "SAYU DAMAR YUNAN" },
    { nim: "434231080", nama: "HELMI SA'ID HIDAYATULLOH" },
    { nim: "434231081", nama: "AERIO DAVID TIRTA ATMODJO" },
    { nim: "434231083", nama: "REYNALDI SUSILO WASKITO" },
    { nim: "434231088", nama: "AHMAD SYAUQI NURI" },
    { nim: "434231090", nama: "KHAISA ZUMMA SALSABHILA" },
    { nim: "434231094", nama: "TITO MUHAMMAD GAFA" },
    { nim: "434231099", nama: "PEDJA RAFSANJANI" },
    { nim: "434231104", nama: "MUHAMMAD CATRA HANIF 'AZMI" },
    { nim: "434231106", nama: "DEFRIAN BAGUS DEWANTA PUTRA" },
    { nim: "434231107", nama: "RISFIANA NUR FARIDA" },
    { nim: "434231109", nama: "YURO ARUMANDJI" },
    { nim: "434231111", nama: "MUHAMMAD HAIKAL BIMA" },
    { nim: "434231112", nama: "FESTIANA RAMAYA PUTRI" },
    { nim: "434231117", nama: "MOHAMMAD HAFIDZ AL MAAHER" },
    { nim: "434231118", nama: "MUHAMMAD RIDHA HAFIDZ" },
];

// Fungsi login: cek NIM dan password (password = NIM)
export function loginStudent(nim: string, password: string): Student | null {
    if (nim !== password) return null;
    return STUDENTS.find((s) => s.nim === nim) || null;
}
