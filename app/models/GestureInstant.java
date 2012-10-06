package models;

import play.db.jpa.Model;

import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.OrderColumn;

/**
 * User: Noel Zeng.
 * Part of models.
 */
@Entity
public class GestureInstant extends Model {
    public long timeElapsed;
    @OneToMany
    @OrderColumn(name("id"))
    //@ElementCollection
    public Touch[] touches;
    
}
