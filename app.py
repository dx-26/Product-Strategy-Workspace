import pandas as pd
import streamlit as st
from domain import rice_score,user_story
from storage import initialize,query,execute

st.set_page_config(page_title="Product Strategy Workspace",page_icon="🧭",layout="wide")
initialize("""
CREATE TABLE IF NOT EXISTS ideas(id INTEGER PRIMARY KEY,name TEXT NOT NULL,problem TEXT NOT NULL,reach REAL NOT NULL,impact REAL NOT NULL,confidence REAL NOT NULL,effort REAL NOT NULL,status TEXT NOT NULL DEFAULT 'Discovery',target_release TEXT);
CREATE TABLE IF NOT EXISTS stories(id INTEGER PRIMARY KEY,idea_id INTEGER NOT NULL,persona TEXT NOT NULL,goal TEXT NOT NULL,benefit TEXT NOT NULL,acceptance TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Backlog',FOREIGN KEY(idea_id) REFERENCES ideas(id));
""","""
INSERT INTO ideas(name,problem,reach,impact,confidence,effort,status,target_release) VALUES
('Self-service onboarding','New users need guided setup',200,2,80,8,'Discovery','2027-Q1'),
('Usage analytics','Teams lack adoption visibility',120,3,70,5,'Planned','2027-Q2'),
('Bulk import','Manual entry slows new customers',90,2,90,4,'Discovery','2027-Q2');
INSERT INTO stories(idea_id,persona,goal,benefit,acceptance) VALUES (1,'new user','complete guided setup','start using the product','Given a new account, when setup finishes, then a completion message appears');
""")
st.title("🧭 Product Strategy Workspace")
st.caption("Make roadmap decisions with transparent prioritization and user stories")
a,b,c=st.tabs(["Prioritization","Capture idea","Backlog & releases"])
with a:
    ideas=query("SELECT * FROM ideas")
    ranked=sorted([{**i,'RICE':rice_score(i['reach'],i['impact'],i['confidence'],i['effort'])} for i in ideas],key=lambda i:i['RICE'],reverse=True)
    st.dataframe(pd.DataFrame(ranked),hide_index=True,use_container_width=True)
    if ranked:
        st.bar_chart(pd.DataFrame(ranked).set_index('name')['RICE'])
        st.metric("Ideas in discovery",sum(i['status']=='Discovery' for i in ranked))
    st.download_button("Export prioritized roadmap",pd.DataFrame(ranked).to_csv(index=False),"roadmap.csv","text/csv")
    st.caption("RICE = reach × impact × confidence (%) ÷ effort. Scores are decision support, not proof of expected impact.")
with b:
    with st.form("idea"):
        name=st.text_input("Feature or idea name")
        problem=st.text_area("Customer problem / evidence")
        c1,c2=st.columns(2)
        reach=c1.number_input("Reach (users per period)",min_value=0.0,value=100.0)
        impact=c2.number_input("Impact multiplier",min_value=0.0,value=2.0,step=0.5)
        confidence=c1.slider("Confidence %",0,100,70)
        effort=c2.number_input("Effort (person-months)",min_value=0.1,value=2.0,step=0.5)
        status=st.selectbox("Status",['Discovery','Planned','In progress','Released'])
        target=st.text_input("Target release (e.g. 2027-Q1)")
        if st.form_submit_button("Save idea"):
            if name.strip() and problem.strip():
                execute("INSERT INTO ideas(name,problem,reach,impact,confidence,effort,status,target_release) VALUES (?,?,?,?,?,?,?,?)",(name.strip(),problem.strip(),reach,impact,confidence,effort,status,target.strip()))
                st.success("Idea saved")
            else: st.error("Name and customer problem are required")
with c:
    ideas=query("SELECT id,name,target_release,status FROM ideas ORDER BY name")
    selections={f"{i['id']}: {i['name']}":i['id'] for i in ideas}
    if ideas:
        with st.form("story"):
            idea=st.selectbox("Related idea",list(selections))
            persona=st.text_input("As a (persona)")
            goal=st.text_input("I want to (goal)")
            benefit=st.text_input("So that (benefit)")
            acceptance=st.text_area("Acceptance criteria (Given / When / Then)")
            if st.form_submit_button("Add user story"):
                try:
                    user_story(persona,goal,benefit)
                    if not acceptance.strip(): raise ValueError("Acceptance criteria required")
                    execute("INSERT INTO stories(idea_id,persona,goal,benefit,acceptance) VALUES (?,?,?,?,?)",(selections[idea],persona.strip(),goal.strip(),benefit.strip(),acceptance.strip()))
                    st.success("Story added")
                except ValueError as exc: st.error(str(exc))
    stories=query("SELECT s.id,i.name AS idea,s.persona,s.goal,s.benefit,s.acceptance,s.status FROM stories s JOIN ideas i ON i.id=s.idea_id ORDER BY s.id DESC")
    if stories:
        st.dataframe(pd.DataFrame([{**s,'user_story':user_story(s['persona'],s['goal'],s['benefit'])} for s in stories]),hide_index=True,use_container_width=True)
    st.subheader("Release roadmap")
    st.dataframe(pd.DataFrame(ideas),hide_index=True,use_container_width=True)
