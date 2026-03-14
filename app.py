import streamlit as st

from database import SessionLocal, init_db
from exporters.excel_exporter import ExcelExporter
from services.auth_service import AuthService
from services.enrichment_service import EnrichmentService
from services.google_places_service import GooglePlacesService


init_db()


def render_header():
    st.markdown(
        """
        <h1 style="text-align: center; color: #0F4C81; margin-bottom: 0;">
            Lead Finder
        </h1>
        <p style="text-align: center; color: #555; margin-top: 0;">
            Encontre e enriqueça leads do Google automaticamente
        </p>
        <hr/>
        """,
        unsafe_allow_html=True,
    )


def login_page():
    render_header()

    with st.container():
        st.subheader("Acessar conta")

        email = st.text_input("E-mail")
        password = st.text_input("Senha", type="password")

        col1, col2 = st.columns(2)

        with col1:
            login_clicked = st.button("Entrar")

        with col2:
            register_clicked = st.button("Cadastrar novo usuário")

        if login_clicked:
            if not email or not password:
                st.warning("Informe e-mail e senha para entrar.")
            else:
                db = SessionLocal()
                try:
                    auth = AuthService(db)
                    user = auth.authenticate(email=email, password=password)
                    if user:
                        st.session_state["current_user"] = {
                            "id": user.id,
                            "email": user.email,
                        }
                        st.success("Login realizado com sucesso.")
                        st.rerun()
                    else:
                        st.error("E-mail ou senha inválidos.")
                finally:
                    db.close()

        if register_clicked:
            if not email or not password:
                st.warning("Informe e-mail e senha para cadastrar.")
            else:
                db = SessionLocal()
                try:
                    auth = AuthService(db)
                    existing = auth.get_user_by_email(email=email)
                    if existing:
                        st.warning("Já existe um usuário com esse e-mail.")
                    else:
                        auth.create_user(email=email, password=password)
                        st.success("Usuário criado com sucesso. Você já pode fazer login.")
                finally:
                    db.close()


def lead_finder_page():
    render_header()

    user = st.session_state.get("current_user")
    with st.sidebar:
        st.markdown(f"**Usuário:** {user['email']}")
        if st.button("Sair"):
            st.session_state.pop("current_user", None)
            st.rerun()

    st.subheader("Buscar leads no Google")

    query = st.text_input("Buscar empresas (ex: academia sao paulo)")

    max_leads = st.number_input(
        "Quantidade de leads para buscar (máx. 60)",
        min_value=1,
        max_value=60,
        value=20,
        step=1,
    )

    run = st.button("Buscar Leads")

    if run:
        if not query:
            st.warning("Digite um termo de busca para continuar.")
            return

        places = GooglePlacesService()
        enrich = EnrichmentService()
        exporter = ExcelExporter()

        with st.spinner("Buscando leads..."):
            leads = []

            place_ids = places.search_places(query, int(max_leads))

            for pid in place_ids:
                data = places.get_details(pid)

                extra = enrich.enrich(data.get("website"))

                data.update(extra)

                leads.append(data)

            file = exporter.export(leads, query)

        st.success(f"{len(leads)} leads encontrados")

        with open(file, "rb") as f:
            st.download_button("Baixar Excel", f, file.name)


def main():
    st.set_page_config(page_title="Lead Finder", page_icon="🔍", layout="centered")

    if "current_user" not in st.session_state:
        st.session_state["current_user"] = None

    if st.session_state["current_user"]:
        lead_finder_page()
    else:
        login_page()


if __name__ == "__main__":
    main()
