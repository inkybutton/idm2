package models;

import play.db.jpa.Model;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;

/**
 * User: Noel Zeng.
 * Part of models.
 * A Touch is a coordinate on a screen made by a user.
 * It contains the identifier of the finger that touched the screen,
 * as well as a coordinate.
 * A Touch is associated with a particular captured gesture, as the
 * device identifier is not unique across touches.
 * We assume an identifier is unique as long as any device causing the
 * touch is in contact with the device. This is the worst-case scenario
 * and prevents problems with uniqueness of ID.
 */
@Entity
public class Touch extends Model {
    //public Point coord;
    public int x;
    public int y;
    public String identifier;
    @ManyToOne
    public GestureInstant instant;

    public Touch(){

    }
}
