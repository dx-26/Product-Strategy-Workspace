import pytest
from domain import rice_score,user_story

def test_rice():
    assert rice_score(100,2,80,4)==40
    with pytest.raises(ValueError): rice_score(100,2,80,0)
    with pytest.raises(ValueError): rice_score(100,2,101,4)

def test_story():
    assert user_story('learner','track work','stay organized')=='As a learner, I want to track work so that stay organized.'
    with pytest.raises(ValueError): user_story('','','')
